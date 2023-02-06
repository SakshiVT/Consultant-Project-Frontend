export default function timeFormator(time) {

    function unixTimeToHumanReadable(seconds)
    {

        // Save the time in Human
        // readable format
        let ans = "";

        // Number of days in month
        // in normal year
        let daysOfMonth = [ 31, 28, 31, 30, 31, 30,
                              31, 31, 30, 31, 30, 31 ];

        let currYear, daysTillNow, extraTime,
            extraDays, index, date, month, hours,
            minutes, secondss, flag = 0;

        // Calculate total days unix time T
        daysTillNow = parseInt(seconds / (24 * 60 * 60), 10);
        extraTime = seconds % (24 * 60 * 60);
        currYear = 1970;

        // Calculating current year
        while (true) {
        if (currYear % 400 == 0
            || (currYear % 4 == 0 && currYear % 100 != 0)) {
            if (daysTillNow < 366) {
                break;
            }
            daysTillNow -= 366;
        }
        else {
            if (daysTillNow < 365) {
                break;
            }
            daysTillNow -= 365;
        }
        currYear += 1;
    }

        // Updating extradays because it
        // will give days till previous day
        // and we have include current day
        extraDays = daysTillNow + 1;

        if (currYear % 400 == 0 ||
           (currYear % 4 == 0 &&
            currYear % 100 != 0))
            flag = 1;

        // Calculating MONTH and DATE
        month = 0; index = 0;
        if (flag == 1)
        {
            while (true)
            {
                if (index == 1)
                {
                    if (extraDays - 29 < 0)
                        break;

                    month += 1;
                    extraDays -= 29;
                }
                else
                {
                    if (extraDays -
                        daysOfMonth[index] < 0)
                    {
                        break;
                    }
                    month += 1;
                    extraDays -= daysOfMonth[index];
                }
                index += 1;
            }
        }
        else
        {
            while (true)
            {
                if (extraDays - daysOfMonth[index] < 0)
                {
                    break;
                }
                month += 1;
                extraDays -= daysOfMonth[index];
                index += 1;
            }
        }

        // Current Month
        if (extraDays > 0)
        {
            month += 1;
            date = extraDays;
        }
        else
        {
            if (month == 2 && flag == 1)
                date = 29;
            else
            {
                date = daysOfMonth[month - 1];
            }
        }

        // Calculating HH:MM:YYYY
        // hours = parseInt(extraTime / 3600, 10);
        // minutes = parseInt((extraTime % 3600) / 60, 10);
        // secondss = parseInt((extraTime % 3600) % 60, 10);

        ans += date.toString();
        ans += "/";
        ans += month.toString();
        ans += "/";
        ans += currYear.toString();
        // ans += " ";
        // ans += hours.toString();
        // ans += ":";
        // ans += minutes.toString();
        // ans += ":";
        // ans += secondss.toString();

        // Return the time
        return ans;
    }
    
    // Given unix time
    let T = parseInt(time);
 
    // Function call to convert unix
    // time to human read able
    let ans = unixTimeToHumanReadable(T);
 
    // Print time in format
    // DD:MM:YYYY:HH:MM:SS
    return(ans);
}