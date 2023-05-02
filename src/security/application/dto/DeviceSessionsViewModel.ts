export class DeviceSessionsViewModel {
    constructor(
        public ip: string,
        public title: string,
        public lastActiveDate: Date,
        public deviceId: string,
    ) { }
}