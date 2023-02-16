import {Entity, Index, PrimaryKey, Property} from '@mikro-orm/core'

@Entity()
export class File {
    static tableName = 'File'

    @PrimaryKey()
    id!: string

    @Property()
    @Index()
    name!: string

    @Property({default: 'default'})
    @Index()
    folder!: string

    @Property({unsigned: true, default: 0})
    size!: number

    @Property({default: 'application/octet-stream'})
    mimeType!: string

    @Property({defaultRaw: 'now'})
    @Index()
    createTime: Date = new Date()

    @Property({defaultRaw: 'now', onUpdate: () => new Date()})
    updateTime: Date = new Date()

    @Property({nullable: true})
    @Index()
    googleDriveFileId?: string

    @Property({nullable: true})
    googleDriveUploadTime?: Date
}

