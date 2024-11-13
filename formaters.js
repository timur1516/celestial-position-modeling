function formatNumber(value) {
    return value !== undefined ? value.toFixed(2) : "N/A";
}

function formatTime(seconds) {
    const secondsInMinute = 60;
    const secondsInHour = 60 * 60;
    const secondsInDay = 60 * 60 * 24;
    const secondsInMonth = 60 * 60 * 24 * 30;
    const secondsInYear = 60 * 60 * 24 * 365;

    if (seconds < secondsInHour) {
        let minutes = seconds / secondsInMinute;
        return minutes.toFixed(2) + " минут";
    }
    if (seconds < secondsInDay) {
        let hours = seconds / secondsInHour;
        return hours.toFixed(2) + " часов";
    }
    if (seconds < secondsInMonth) {
        let days = seconds / secondsInDay;
        return days.toFixed(2) + " дней";
    }
    if (seconds < secondsInYear) {
        let months = seconds / secondsInMonth;
        return months.toFixed(2) + " месяцев";
    }
    let years = seconds / secondsInYear;
    return years.toFixed(2) + " лет";
}