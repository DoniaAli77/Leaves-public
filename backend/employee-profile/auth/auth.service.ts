import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import {
  EmployeeProfile,
  EmployeeProfileDocument,
} from '../models/employee-profile.schema';
import { EmployeeStatus, SystemRole } from '../enums/employee-profile.enums';
import { RegisterDto } from '../dto/register.dto';
import { ADMIN_ROLES } from '../../common/constants/role-groups';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(EmployeeProfile.name)
    private readonly employeeModel: Model<EmployeeProfileDocument>,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: { employeeNumber: string; password: string }) {
    const employeeNumber = (dto.employeeNumber || '').trim();
    const password = dto.password || '';

    const employee = await this.employeeModel.findOne({ employeeNumber });
    if (!employee) throw new NotFoundException('Employee not found');

    if (!employee.password) {
      throw new UnauthorizedException('Employee has no password set');
    }

    const isMatch = await bcrypt.compare(password, employee.password as string);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    let role: SystemRole;
    const n = employeeNumber.toUpperCase();

    if (n.startsWith('HRADM')) role = SystemRole.HR_ADMIN;
    else if (n.startsWith('HRM') || n.startsWith('HRMAN'))
      role = SystemRole.HR_MANAGER;
    else if (n.startsWith('HRE')) role = SystemRole.HR_EMPLOYEE;
    else if (n.startsWith('DH')) role = SystemRole.DEPARTMENT_HEAD;
    else if (n.startsWith('DEPT')) role = SystemRole.DEPARTMENT_EMPLOYEE;
    else if (n.startsWith('PAYM')) role = SystemRole.PAYROLL_MANAGER;
    else if (n.startsWith('PAYS')) role = SystemRole.PAYROLL_SPECIALIST;
    else if (n.startsWith('SYS')) role = SystemRole.SYSTEM_ADMIN;
    else if (n.startsWith('REC')) role = SystemRole.RECRUITER;
    else if (n.startsWith('FIN')) role = SystemRole.FINANCE_STAFF;
    else role = SystemRole.DEPARTMENT_EMPLOYEE;

    // ✅ IMPORTANT: this is employee_profiles._id
    const payload = {
      id: employee._id.toString(),
      employeeProfileId: employee._id.toString(), // optional but useful
      employeeNumber: employee.employeeNumber,
      username: `${employee.firstName ?? ''} ${employee.lastName ?? ''}`.trim(),
      role,
    };

    const token = await this.jwtService.signAsync(payload);

    return {
      access_token: token,
      payload,
      isAdmin: ADMIN_ROLES.includes(role),
    };
  }

  async register(dto: RegisterDto) {
    const employeeNumber = (dto.employeeNumber || '').trim();

    const exists = await this.employeeModel.findOne({ employeeNumber });
    if (exists) {
      throw new BadRequestException('Employee number already exists ❌');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const newEmployee = new this.employeeModel({
      employeeNumber,
      password: hashedPassword,
      firstName: dto.firstName,
      lastName: dto.lastName,
      nationalId: dto.nationalId,
      dateOfHire: new Date(dto.dateOfHire),
      address: dto.address,
      systemRole: dto.role, // keep as you had it
      status: EmployeeStatus.ACTIVE,
    });

    return newEmployee.save();
  }
}
