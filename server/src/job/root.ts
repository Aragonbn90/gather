import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { CronJob, CronTime } from 'cron';
import { FileService } from '../service/file.service';

@Injectable()
export class RootJob {
  private readonly logger = new Logger(RootJob.name);

  constructor(private schedulerRegistry: SchedulerRegistry,
    private fileService: FileService,
  ) { }

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  handleCron() {
    this.logger.debug('Root job started');

    const retailers: string[] = [];
    retailers.map(r => {
      //search
      const job = new CronJob(new Date(), { command: ,  options: { timeout: 30000 } });
      this.schedulerRegistry.addCronJob(name, job);

      //detail
    })


  }
}