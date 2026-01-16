import { User } from '../../types/User.ts';

declare global {
    namespace Express {
        interface Request {
            user?: User;
        }
    }
}