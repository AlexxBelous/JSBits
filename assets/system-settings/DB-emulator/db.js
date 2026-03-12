export const signalTimestamps = ["23:00","04:22","18:05","06:24"];



const arr1 = [
    1,2,3,4,5,6,7,8,9,10,
    11,12,13,14,15,16,17,18,19,20,
    21,22,23,24
];

const arr2 = [
    5,6,7,8,9,10,11,12,13,14,
    15,16,17,18,19,20,21,22,23,24,
    25,26,27,28
];

const arr3 = [
    10,11,12,13,14,15,16,17,18,19,
    20,21,22,23,24,25,26,27,28,29,
    30,31,32,33
];

const arr4 = [
    17,3,25,8,1,14,9,30,6,21,
    11,4,28,19,2,23,7,16,12,27,
    5,20,10,24
];

const arrays = [arr1, arr2, arr3, arr4];

export function randomNumberSet() {
    return arrays[Math.floor(Math.random() * arrays.length)];
}