import {Entity, Index, PrimaryKey, Property} from '@mikro-orm/core'

@Entity()
export class AppLink {
    @PrimaryKey()
    id!: number

    @Property({unique: true})
    @Index()
    name!: string

    @Property({nullable: true})
    iosLink?: string

    @Property({nullable: true})
    androidLink?: string

    @Property({defaultRaw: 'now'})
    @Index()
    createTime: Date = new Date()

    @Property({defaultRaw: 'now', onUpdate: () => new Date()})
    updateTime: Date = new Date()
}
