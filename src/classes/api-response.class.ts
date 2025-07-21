import { ApiProperty } from '@nestjs/swagger';

export class ApiResponse<T> {
    @ApiProperty({
        description: 'Mã trạng thái HTTP',
        example: 200,
    })
    statusCode: number;

    @ApiProperty({
        description: 'Thông báo phản hồi',
        example: 'Thành công',
    })
    message: string;

    @ApiProperty()
    data?: T;

    constructor(status: number, message: string, data?: T) {
        this.statusCode = status;
        this.message = message;
        this.data = data;
    }
}
