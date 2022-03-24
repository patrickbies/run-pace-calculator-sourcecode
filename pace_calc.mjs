// table to store conversion between units and kilometers:
const unit_conversion = {
    'km': 1, 
    'mi': 1.60934,
    'm': 0.001,
    'yrd': 0.0009144,
    'marathon': 42.195,
    'half-marathon': 21.0975,
    '100km': 100,
    '50km': 50,
    '20km': 20,
    '10km': 10,
    '5km': 5,
    '3km': 3,
    '2mi': 3.21869,
    '100mi': 160.934,
    '1500m': 1.5,
    '800m': 0.8,
    '400m': 0.4,
    '200m': 0.2,
    '100m': 0.1
}

// CHECK: time to seconds converted correctly: Yes
function time_to_sec(time)
{
    for (let i = 0; i < 3; i++)
        if (!time[i]) time[i] = 0;

    return parseInt(time[0] * 3600) + parseInt(time[1] * 60) + parseInt(time[2]);
}

function find_missing(time, pace, distance)
{
    let t, d, p, c = 0;
    t = p = d = false;
    
    // Check if time is missing:
    if (time[0] || time[1] || time[2])
    {
        t = true;
        c++;
    }
    
    // Check if distance is missing:
    if (distance)
    {
        d = true;
        c++;
    }

    // Check if pace is missing:
    if (pace[0] || pace[1] || pace[2])
    {
        p = true;
        c++;
    }

    /* Return Values:
        0: Incorrect amount of information given,
        1: Time missing,
        2: Distance missing,
        3: Pace missing,
        4: pace and distance missing, (default distance to 1)
        5: time and distance missing, (default distance to 1)
    */

    if (c == 1 && !d)
    {
        return t ? 4 : p ? 5 : 0;
    }
    return (c >= 2) ? (c > 2) ? 3 : (!t) ? 1 : (!d) ? 2 : (!p) ? 3 : 0 : 0;
}

// assuming distance is in km, pace is in s/km:
function solve_time(distance, pace)
{
    return distance * pace;
}

// assuming pace is in s/km:
function solve_distance(time, pace)
{
    return time / pace;
}

// assuming distance is in km:
function solve_pace(time, distance)
{
    return time / distance;
}

export function calculate_all(query)
{
    // CHECK: stores time correctly: Yes
    const time = [
        query['time-hours'],
        query['time-minutes'],
        query['time-seconds'],
    ];
    const time_in_seconds = time_to_sec(time);

    // CHECK: stores pace correctly: Yes
    const pace = [
        query['pace-hours'],
        query['pace-minutes'],
        query['pace-seconds'],
    ];
    const pace_in_seconds = time_to_sec(pace);

    //CHECK: distance handled correctly: Yes
    const distance = query['distance'];
    const distance_units = query['d-measurement'];
    const dist_conversion = unit_conversion[distance_units];
    const distance_in_km = distance * dist_conversion;

    //CHECK: pace handled correctly: Yes
    const pace_units = query['p-measurement'];
    const pace_dist = query['pace-distance'] ? query['pace-distance'] : 1;
    const pace_conversion = unit_conversion[pace_units] * pace_dist;
    const pace_in_km = pace_in_seconds / pace_conversion;

    console.log(pace_in_km, distance_in_km);

    switch (find_missing(time, pace, distance)) 
    {
        case 1: 
            return [
                solve_time(distance_in_km, pace_in_km),
                distance_in_km,
                pace_in_km,
                distance_units, pace_units,
                dist_conversion, pace_conversion, pace_dist, 1
            ];
        
        case 2:
            return [
                time_in_seconds,
                solve_distance(time_in_seconds, pace_in_km),
                pace_in_km,
                distance_units, pace_units,
                dist_conversion, pace_conversion, pace_dist, 2
            ];
        
        case 3:
            return [
                time_in_seconds,
                distance_in_km,
                solve_pace(time_in_seconds, distance_in_km),
                distance_units, pace_units,
                dist_conversion, pace_conversion, pace_dist, 3
            ];
        
        case 4:
            return [
                time_in_seconds,
                dist_conversion,
                solve_pace(time_in_seconds, dist_conversion),
                distance_units, pace_units,
                dist_conversion, pace_conversion, pace_dist, 3
            ];
            
        case 5:
            return [
                solve_time(dist_conversion, pace_in_km),
                dist_conversion,
                pace_in_km,
                distance_units, pace_units,
                dist_conversion, pace_conversion, pace_dist, 1
            ];

        default: 
            return 0;
    }
}

export function time_from_seconds(seconds)
{
    const h = seconds / 3600;
    const m = h % 1 * 60;
    const s = m % 1 * 60;

    return [
        Math.floor(h),
        Math.floor(m),
        Math.round(s)
    ];
}

export function format_time(time)
{
    for (let i = 0; i < 3; i++)
    {
        if (time[i] < 10)
        {
            time[i] = '0' + time[i];
        }
    }

    return time; 
}
