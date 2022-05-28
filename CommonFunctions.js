const dateAndTime = () => {
    let d = new Date();
    utc = d.getTime() + (d.getTimezoneOffset() * 60000);
    const now = new Date(utc + (60 * 60 * 1000 * 5.5));
    const date = now.toGMTString();
    return date;
}

module.exports.dateAndTime = dateAndTime;

const timeStamp = () => {
    let d = new Date();
    utc = d.getTime() + (d.getTimezoneOffset() * 60000);
    const now = new Date(utc + (60 * 60 * 1000 * 5.5));    
    return now.getTime();
}
module.exports.timeStamp = timeStamp;
