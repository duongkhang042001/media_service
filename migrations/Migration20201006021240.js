'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const Migration = require('@mikro-orm/migrations').Migration;

class Migration20201006021240 extends Migration {

  async up() {
    this.addSql('create table `File` (`id` varchar not null, `name` varchar not null, `folder` varchar not null default \'default\', `size` integer not null default 0, `mimeType` varchar not null default \'application/octet-stream\', `createTime` datetime not null default now, `updateTime` datetime not null default now, `googleDriveFileId` varchar null, `googleDriveUploadTime` datetime null, primary key (`id`));');
    this.addSql('create index `File_name_index` on `File` (`name`);');
    this.addSql('create index `File_folder_index` on `File` (`folder`);');
    this.addSql('create index `File_createTime_index` on `File` (`createTime`);');
    this.addSql('create index `File_googleDriveFileId_index` on `File` (`googleDriveFileId`);');

    this.addSql('create table `AppLink` (`id` integer not null primary key autoincrement, `name` varchar not null, `iosLink` varchar null, `androidLink` varchar null, `createTime` datetime not null default now, `updateTime` datetime not null default now);');
    this.addSql('create index `AppLink_name_index` on `AppLink` (`name`);');
    this.addSql('create unique index `AppLink_name_unique` on `AppLink` (`name`);');
    this.addSql('create index `AppLink_createTime_index` on `AppLink` (`createTime`);');
  }

}
exports.Migration20201006021240 = Migration20201006021240;
