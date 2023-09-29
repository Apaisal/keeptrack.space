import { Degrees, Kilometers, Radians } from 'ootk';
import { alt2zoom, dateFromJday, dateToLocalInIso, getDayOfYear, jday, lat2pitch, localToZulu, lon2yaw, normalizeAngle } from '../src/js/lib/transforms';
import { RADIUS_OF_EARTH, TAU } from './../src/js/lib/constants';

// Generated by CodiumAI
/*
Code Analysis

Objective:
The objective of the normalizeAngle function is to ensure that the input angle is within the range of -π to π radians, by normalizing it to the equivalent angle within this range.

Inputs:
- angle: a Radians value representing the angle to be normalized.

Flow:
1. Calculate the remainder of angle divided by TAU (2π radians), and assign it to normalizedAngle.
2. If normalizedAngle is greater than TAU/2, subtract TAU from it.
3. If normalizedAngle is less than -TAU/2, add TAU to it.
4. Return normalizedAngle as a Radians value.

Outputs:
- A Radians value representing the normalized angle.

Additional aspects:
- The function uses the TAU constant, which is defined as 2π radians.
- The function ensures that the output angle is within the range of -π to π radians, which is useful for various calculations involving angles.
- The function does not modify the input angle, but returns a new value instead.
*/

describe('normalizeAngle_function', () => {
  // Tests that a positive angle within the range of 0 to 2π is normalized correctly
  it('test_positive_angle_within_range', () => {
    expect(normalizeAngle(<Radians>1)).toBeCloseTo(1);
    expect(normalizeAngle(<Radians>(TAU - 0.1))).toBeCloseTo(-0.1);
  });

  // Tests that a negative angle within the range of -2π to 0 is normalized correctly
  it('test_negative_angle_within_range', () => {
    expect(normalizeAngle(<Radians>-1)).toBeCloseTo(-1);
    expect(normalizeAngle(<Radians>(-TAU + 0.1))).toBeCloseTo(0.1);
  });

  // Tests that an angle of 0 is normalized correctly
  it('test_angle_zero', () => {
    expect(normalizeAngle(<Radians>0)).toBeCloseTo(0);
  });

  // Tests that an angle greater than 2π is normalized correctly
  it('test_angle_greater_than_2pi', () => {
    expect(normalizeAngle(<Radians>(TAU + 0.1))).toBeCloseTo(0.1);
    expect(normalizeAngle(<Radians>(1.5 * TAU))).toBeCloseTo(0.5 * TAU);
  });

  // Tests that an angle less than -2π is normalized correctly
  it('test_angle_less_than_negative_2pi', () => {
    expect(normalizeAngle(<Radians>(-TAU + 0.1))).toBeCloseTo(0.1);
    expect(normalizeAngle(<Radians>(1.5 * -TAU))).toBeCloseTo(0.5 * -TAU);
  });

  // Tests that a positive angle greater than π and less than 2π is normalized correctly
  it('test_angle_greater_than_pi_and_less_than_2pi', () => {
    expect(normalizeAngle(<Radians>(1.5 * Math.PI))).toBeCloseTo(-0.5 * Math.PI);
    expect(normalizeAngle(<Radians>(1.75 * Math.PI))).toBeCloseTo(-0.25 * Math.PI);
  });
});

// Generated by CodiumAI
/*
Code Analysis

Objective:
The objective of the 'lon2yaw' function is to calculate the yaw angle in radians based on the longitude and selected date inputs.

Inputs:
- 'lon': a number representing the longitude in degrees.
- 'selectedDate': a Date object representing the selected date.

Flow:
1. Initialize 'realTime' and 'propTime' Date objects.
2. Calculate the day of year using the 'getDayOfYear' function.
3. Calculate the modifier based on the day of year.
4. Set the 'propTime' object to the same time as the 'selectedDate' object, with the modifier added.
5. Set the 'realTime' object to midnight UTC.
6. Calculate the longitude offset in hours based on the difference between 'propTime' and 'realTime'.
7. Convert the longitude offset to degrees.
8. Calculate the yaw angle in radians based on the sum of 'lon' and 'longOffsetAngle'.
9. Normalize the angle using the 'normalizeAngle' function.
10. Return the normalized angle.

Outputs:
- A number representing the yaw angle in radians.

Additional aspects:
- The function uses the 'getDayOfYear' and 'normalizeAngle' functions from other modules.
- The function includes notes about potential issues with the camera formula and daylight savings time.
*/

describe('lon2yaw_function', () => {
  // Tests that the function returns a valid yaw angle when given a valid longitude and date
  it('test_valid_longitude_and_date', () => {
    const lon = <Degrees>45;
    const date = new Date('2022-01-01T00:00:00.000Z');
    const yaw = lon2yaw(lon, date);
    expect(yaw).toMatchSnapshot();
  });

  // Tests that the function returns a valid yaw angle when given a valid longitude and a date that is one hour ahead of UTC
  it('test_valid_longitude_and_date_one_hour_ahead_of_UTC', () => {
    const lon = <Degrees>45;
    const date = new Date('2022-01-01T01:00:00.000Z');
    const yaw = lon2yaw(lon, date);
    expect(yaw).toMatchSnapshot();
  });

  // Tests that the function returns a valid yaw angle when given a valid longitude and a date that is one hour behind UTC
  it('test_valid_longitude_and_date_one_hour_behind_UTC', () => {
    const lon = <Degrees>45;
    const date = new Date('2022-01-01T23:00:00.000Z');
    const yaw = lon2yaw(lon, date);
    expect(yaw).toMatchSnapshot();
  });

  // Tests that the function returns a valid yaw angle when given a longitude of 180 degrees
  it('test_longitude_180_degrees', () => {
    const lon = <Degrees>180;
    const date = new Date('2022-01-01T00:00:00.000Z');
    const yaw = lon2yaw(lon, date);
    expect(yaw).toMatchSnapshot();
  });

  // Tests that the function returns a valid yaw angle when given a longitude of -180 degrees
  it('test_longitude_minus_180_degrees', () => {
    const lon = <Degrees>-180;
    const date = new Date('2022-01-01T00:00:00.000Z');
    const yaw = lon2yaw(lon, date);
    expect(yaw).toMatchSnapshot();
  });

  // Tests that the function returns NaN when given an invalid date
  it('test_invalid_date', () => {
    const lon = <Degrees>45;
    const date = new Date('invalid date');
    const yaw = lon2yaw(lon, date);
    expect(isNaN(yaw)).toBe(true);
  });
});

// Generated by CodiumAI
/*
Code Analysis

Objective:
The objective of the "lat2pitch" function is to convert a given latitude value in degrees to its corresponding pitch value in radians, which is used in various applications such as 3D graphics and mapping.

Inputs:
- "lat": a value representing the latitude in degrees.

Flow:
1. The function initializes a constant "QUARTER_TAU" which is equal to TAU (2 * PI) divided by 4.
2. The function multiplies the input "lat" by the constant "DEG2RAD" to convert it from degrees to radians and assigns it to the variable "pitch".
3. The function uses the "Math.min" and "Math.max" functions to ensure that the "pitch" value is within the range of -QUARTER_TAU to QUARTER_TAU.
4. The function returns the "pitch" value as output.

Outputs:
- "pitch": a value representing the pitch in radians.

Additional aspects:
- The function uses constants "TAU" and "DEG2RAD" which are imported from the "constants" module.
- The function uses the "Math.min" and "Math.max" functions to ensure that the output value is within a certain range.
- The function returns the output value as a "Radians" type.
*/

describe('lat2pitch_function', () => {
  // Tests that a positive latitude value is correctly converted to pitch in radians
  it('test_positive_latitude', () => {
    expect(lat2pitch(<Degrees>45)).toBeCloseTo(0.7854, 4);
  });

  // Tests that a negative latitude value is correctly converted to pitch in radians
  it('test_negative_latitude', () => {
    expect(lat2pitch(<Degrees>-45)).toBeCloseTo(-0.7854, 4);
  });

  // Tests that a latitude value equal to zero is correctly converted to pitch in radians
  it('test_latitude_zero', () => {
    expect(lat2pitch(<Degrees>0)).toBeCloseTo(0, 4);
  });

  // Tests that a latitude value greater than 90 degrees is correctly converted to pitch in radians
  it('test_latitude_greater_than_90', () => {
    expect(lat2pitch(<Degrees>100)).toBeCloseTo(1.57079, 4);
  });

  // Tests that a latitude value less than -90 degrees is correctly converted to pitch in radians
  it('test_latitude_less_than_minus_90', () => {
    expect(lat2pitch(<Degrees>-100)).toBeCloseTo(-1.57079, 4);
  });

  // Tests that a latitude value that is not a number returns NaN
  it('test_latitude_not_a_number', () => {
    expect(lat2pitch(<Degrees>NaN)).toBeNaN();
  });
});

// Generated by CodiumAI
/*
Code Analysis

Objective:
The objective of the alt2zoom function is to convert an altitude value in kilometers to a zoom level between a minimum and maximum value for a camera.

Inputs:
- alt: a value in kilometers representing the altitude
- minZoomDistance: a value in kilometers representing the minimum zoom distance
- maxZoomDistance: a value in kilometers representing the maximum zoom distance

Flow:
1. Check if minZoomDistance is less than maxZoomDistance, if not, throw an error
2. Calculate the distance from the center by adding the altitude, the radius of the earth, and 30
3. Calculate the zoom level using a formula that takes into account the distance from the center, the minimum zoom distance, and the maximum zoom distance
4. Return the calculated zoom level, ensuring that it is within the range of the minimum and maximum zoom levels

Outputs:
- A number representing the calculated zoom level

Additional aspects:
- The function uses constants from an external file, including the radius of the earth and the zoom exponent
- The function uses the Kilometers type from an external library
- The function includes a check to ensure that the minimum zoom distance is less than the maximum zoom distance
- If the calculated zoom level is NaN, the function returns the minimum zoom level
- The function ensures that the calculated zoom level is within the range of the minimum and maximum zoom levels

*/

describe('alt2zoom_function', () => {
  const minZoom = <Kilometers>7000;
  const maxZoom = <Kilometers>40000;
  const minDist = <Kilometers>30;

  // Tests that function returns 0 when alt is equal to minZoomDistance
  it('test_happy_path_alt_equal_min_zoom_distance', () => {
    const alt = minZoom - RADIUS_OF_EARTH + 30;
    expect(alt2zoom(<Kilometers>alt, minZoom, maxZoom, minDist)).toBeCloseTo(0.123);
  });

  // Tests that function returns 1 when alt is equal to maxZoomDistance
  it('test_happy_path_alt_equal_max_zoom_distance', () => {
    expect(alt2zoom(maxZoom, minZoom, maxZoom, minDist)).toBe(1);
  });

  // Tests that function returns a number between 0 and 1 when alt is between minZoomDistance and maxZoomDistance
  it('test_happy_path_alt_between_min_and_max_zoom_distance', () => {
    expect(alt2zoom(<Kilometers>50, minZoom, maxZoom, minDist)).toBeGreaterThan(0);
    expect(alt2zoom(<Kilometers>50, minZoom, maxZoom, minDist)).toBeLessThan(1);
  });

  // Tests that function returns NaN when alt is less than minZoomDistance
  it('test_edge_case_alt_less_than_min_zoom_distance', () => {
    expect(isNaN(alt2zoom(<Kilometers>-1, minZoom, maxZoom, minDist))).toBe(false);
  });

  // Tests that function returns a number greater than 1 when alt is greater than maxZoomDistance
  it('test_edge_case_alt_greater_than_max_zoom_distance', () => {
    expect(alt2zoom(<Kilometers>100000, minZoom, maxZoom, minDist)).toBe(1);
  });

  // Tests that function returns NaN when minZoomDistance is greater than maxZoomDistance
  it('test_edge_case_min_zoom_distance_greater_than_max_zoom_distance', () => {
    expect(() => alt2zoom(<Kilometers>50, maxZoom, minZoom, minDist)).toThrowError();
  });
});

// Generated by CodiumAI

/*
Code Analysis

Objective:
The objective of the "getDayOfYear" function is to calculate the day of the year for a given date, taking into account leap years.

Inputs:
- date (optional): a Date object representing the date to calculate the day of the year for. If not provided, the current date is used.

Flow:
- An array "dayCount" is defined with the number of days in each month up to February.
- The month and day of the provided date are obtained using the "getMonth" and "getUTCDate" methods.
- The day of the year is calculated by adding the number of days in the previous months to the day of the current month.
- If the current month is after February and the year is a leap year (determined by the "_isLeapYear" function), one day is added to the result.
- The day of the year is returned.

Outputs:
- dayOfYear: a number representing the day of the year for the provided date.

Additional aspects:
- The function has a default parameter for the date, so it can be called without any arguments to get the day of the year for the current date.
- The "_isLeapYear" function is used to determine if a year is a leap year.
*/

describe('getDayOfYear_function', () => {
  // Tests that January 1st returns 1
  it('test_january_1st', () => {
    const date = new Date('2022-01-01T00:00:00.000Z');
    expect(getDayOfYear(date)).toBe(1);
  });

  // Tests that December 31st in a non-leap year returns 365
  it('test_december_31st_non_leap_year', () => {
    const date = new Date('2022-12-31T00:00:00.000Z');
    expect(getDayOfYear(date)).toBe(365);
  });

  // Tests that December 31st in a leap year returns 366
  it('test_december_31st_leap_year', () => {
    const date = new Date('2020-12-31T00:00:00.000Z');
    expect(getDayOfYear(date)).toBe(366);
  });

  // Tests that March 1st in a non-leap year returns 60
  it('test_march_1st_non_leap_year', () => {
    const date = new Date('2022-03-01T00:00:00.000Z');
    expect(getDayOfYear(date)).toBe(60);
  });

  // Tests that March 1st in a leap year returns 61
  it('test_march_1st_leap_year', () => {
    const date = new Date('2020-03-01T00:00:00.000Z');
    expect(getDayOfYear(date)).toBe(61);
  });

  // Tests that February 28th in a non-leap year returns 59
  it('test_february_28th_non_leap_year', () => {
    const date = new Date('2022-02-28T00:00:00.000Z');
    expect(getDayOfYear(date)).toBe(59);
  });
});

// Generated by CodiumAI

/*
Code Analysis

Objective:
The jday function calculates the julian day for a given date and time.

Inputs:
- year: a number representing the year (e.g. 2021)
- month: a number representing the month (1-12)
- day: a number representing the day of the month (1-31)
- hour: a number representing the hour of the day (0-23)
- minute: a number representing the minute of the hour (0-59)
- second: a number representing the second of the minute (0-59)

Flow:
1. Multiply the year by 367.0
2. Subtract the integer value of 7 times the quantity of the year plus the integer value of the quantity of the month plus 9 divided by 12, all multiplied by 0.25
3. Add the integer value of 275 times the month divided by 9
4. Add the day
5. Add 1721013.5
6. Add the decimal value of the time (hour, minute, and second) converted to a fraction of a day
7. Return the result

Outputs:
- A number representing the julian day

Additional aspects:
- The function uses several mathematical operations to calculate the julian day, including multiplication, division, and truncation.
- The julian day is a commonly used astronomical calculation for determining the position of celestial bodies.
*/

describe('jday_function', () => {
  // Copilot generated test case
  it('should calculate the Julian date correctly', () => {
    // Test a valid date
    expect(jday(2022, 10, 31, 12, 0, 0)).toBeCloseTo(2459884, 0);

    // Test a date in the year 2001
    expect(jday(2001, 1, 1, 0, 0, 0)).toBeCloseTo(2451910.5);

    // Test a date in the year 2025
    expect(jday(2025, 12, 31, 23, 59, 59)).toBeCloseTo(2461041.499988426);

    // Test a date on a leap year
    expect(jday(2024, 2, 29, 0, 0, 0)).toBeCloseTo(2460369.5);
  });

  // Tests that passing a year less than 0 throws an error.
  it('test_negative_year', () => {
    expect(() => jday(-2022, 10, 31, 12, 0, 0)).toThrow();
  });

  // Tests that passing a month less than 0 throws an error.
  it('test_month_less_than_1', () => {
    expect(() => jday(2022, -1, 31, 12, 0, 0)).toThrow();
  });

  // Tests that passing a month greater than 12 throws an error.
  it('test_month_greater_than_12', () => {
    expect(() => jday(2022, 13, 31, 12, 0, 0)).toThrow();
  });

  // Tests that passing a day less than 0 throws an error.
  it('test_day_less_than_1', () => {
    expect(() => jday(2022, 10, -1, 12, 0, 0)).toThrow();
  });

  // Tests that passing a day greater than 31 throws an error.
  it('test_day_greater_than_31', () => {
    expect(() => jday(2022, 10, 32, 12, 0, 0)).toThrow();
  });

  // Tests that passing an hour less than 0 throws an error.
  it('test_hour_less_than_0', () => {
    expect(() => jday(2022, 10, 10, -1, 0, 0)).toThrow();
  });

  // Tests that passing an hour greater than 23 throws an error.
  it('test_hour_greater_than_23', () => {
    expect(() => jday(2022, 10, 10, 24, 0, 0)).toThrow();
  });

  // Tests that passing a minute less than 0 throws an error.
  it('test_minute_less_than_0', () => {
    expect(() => jday(2022, 10, 10, 0, -1, 0)).toThrow();
  });
});

// Generated by CodiumAI

/*
Code Analysis

Objective:
The objective of the 'localToZulu' function is to convert a given local date to its corresponding UTC date.

Inputs:
- 'date': a Date object representing the local date to be converted.

Flow:
1. The function calls the 'dateFormat' function to format the input date as an ISO date string in UTC time zone.
2. The ISO date string is split into date and time components.
3. The date and time components are concatenated with 'T' and 'Z' respectively to form a new ISO date string in UTC time zone.
4. The new ISO date string is converted to a Date object representing the corresponding UTC date.
5. The UTC date is returned as the output of the function.

Outputs:
- A Date object representing the corresponding UTC date.

Additional aspects:
- The 'dateFormat' function is imported from an external module.
- The 'dateFormat' function is used to format the input date as an ISO date string in UTC time zone.
- The 'dateFormat' function is called with the 'isoDateTime' mask to format the date string as 'yyyy-mm-dd HH:MM:SS'.
- The 'true' argument is passed to the 'dateFormat' function to indicate that the date should be formatted in UTC time zone.
- The 'localToZulu' function assumes that the input date is in the local time zone of the system running the code.
*/

describe('localToZulu_function', () => {
  // Tests that passing a valid date object returns a new date object in UTC timezone.
  it('test_valid_date_object', () => {
    // Create a date object representing 1 Jan 2021 00:00:00 in eastern time zone.
    const date = new Date('2021-01-01T00:00:00.000-05:00');
    const result = localToZulu(date);
    expect(result).toEqual(new Date('2021-01-01T05:00:00.000-00:00'));
  });
});

// Generated by CodiumAI

/*
Code Analysis

Objective:
The objective of the dateFromJday function is to convert a given year and day of the year into a Date object.

Inputs:
- year: a number representing the year for which the date needs to be calculated
- day: a number representing the day of the year for which the date needs to be calculated

Flow:
1. Initialize a new Date object with the year passed as input and January 1st as the month and day.
2. Set the UTC date of the initialized date object to the day passed as input.
3. Return the resulting Date object.

Outputs:
- A Date object representing the date corresponding to the year and day of the year passed as input.

Additional aspects:
- The function uses the Date.UTC method to ensure that the resulting Date object is in UTC time.
- The function assumes that the year passed as input is a valid year and does not perform any validation on the input.
*/

describe('dateFromJday_function', () => {
  // Tests that passing a valid year and day returns a Date object
  it('test_valid_year_and_day', () => {
    expect(dateFromJday(2022, 1)).toEqual(new Date(Date.UTC(2022, 0, 1)));
    expect(dateFromJday(2022, 365)).toEqual(new Date(Date.UTC(2022, 11, 31)));
    expect(dateFromJday(2020, 60)).toEqual(new Date(Date.UTC(2020, 1, 29)));
  });

  // Tests that passing year as 0 returns a Date object with year 1900
  it('test_year_zero', () => {
    expect(dateFromJday(0, 1)).toEqual(new Date(Date.UTC(1900, 0, 1)));
  });

  // Tests that passing a negative year throws an error
  it('test_negative_year', () => {
    expect(() => dateFromJday(-1, 1)).toThrow();
  });

  // Tests that passing a day less than 1 or greater than 365/366 throws an error
  it('test_day_out_of_range', () => {
    expect(() => dateFromJday(2022, 0)).toThrow();
    expect(() => dateFromJday(2022, 366)).toThrow();
    expect(() => dateFromJday(2022, -1)).toThrow();
  });
});

// Generated by CodiumAI

/*
Code Analysis

Objective:
The objective of the function is to convert a given date object to a local date in ISO format.

Inputs:
- A date object

Flow:
1. Calculate the offset in milliseconds based on the timezone offset of the input date.
2. Create a new date object by subtracting the offset from the input date's time.
3. Convert the local date to an ISO string.
4. Return the ISO string with the time zone information removed.

Outputs:
- A string representing the local date in ISO format without time zone information.

Additional aspects:
- The function uses the built-in Date object and its methods to perform the conversion.
- The function assumes that the input date is in UTC time zone.
- The function does not modify the input date object.
*/

describe('dateToLocalInIso_function', () => {
  // Tests that passing a valid date object returns a string in ISO format with local time.
  it('test_valid_date_object_returns_iso_with_local_time', () => {
    const date = new Date('2022-01-01T00:00:00Z');
    const result = dateToLocalInIso(date);
    expect(result).toMatchSnapshot();
  });

  // Tests that passing a date object with a timezone ahead of UTC returns a string in ISO format with local time.
  it('test_date_object_with_timezone_ahead_of_utc_returns_iso_with_local_time', () => {
    const date = new Date('2022-01-01T12:00:00+02:00');
    const result = dateToLocalInIso(date);
    expect(result).toMatchSnapshot();
  });

  // Tests that passing a date object with a timezone behind UTC returns a string in ISO format with local time.
  it('test_date_object_with_timezone_behind_utc_returns_iso_with_local_time', () => {
    const date = new Date('2022-01-01T12:00:00-02:00');
    const result = dateToLocalInIso(date);
    expect(result).toMatchSnapshot();
  });

  // Tests that passing an invalid date object throws an error.
  it('test_invalid_date_object_throws_error', () => {
    const date = new Date('invalid date');
    expect(() => dateToLocalInIso(date)).toThrow();
  });
});