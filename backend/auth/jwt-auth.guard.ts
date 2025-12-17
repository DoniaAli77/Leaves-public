import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { SystemRole } from '.././employee-profile/enums/employee-profile.enums';
@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    // Placeholder: Allow all requests. Replace with JWT validation logic.
    const req = context.switchToHttp().getRequest();

    //req.user = {id: 'adminUser',roles: [SystemRole.SYSTEM_ADMIN],};

    //req.user = {id: 'demoUser', roles: [SystemRole.DEPARTMENT_EMPLOYEE],};

    req.user = { id: 'demoUser', roles: ['hr_manager', 'hr_employee', 'candidate'] }; // For testing guards
    return true;
  }
}
