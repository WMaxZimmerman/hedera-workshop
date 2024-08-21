import { Injectable } from '@nestjs/common';

@Injectable()
export class LoggerService {
    public LogObject(title: string, obj: any) {
        console.log();
        console.log(`=================== ${title} ===================`);
        console.log(obj);
        console.log(`=================== ${title} ===================`);
        console.log();
    }
}
