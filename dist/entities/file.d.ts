export declare class File {
    static tableName: string;
    id: string;
    name: string;
    folder: string;
    size: number;
    mimeType: string;
    createTime: Date;
    updateTime: Date;
    googleDriveFileId?: string;
    googleDriveUploadTime?: Date;
}
