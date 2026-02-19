const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

dayjs.extend(utc);
dayjs.extend(timezone);

const TZ = 'America/Bogota';

function nowBogota() {
  return dayjs().tz(TZ);
}

function toBogota(date) {
  return dayjs(date).tz(TZ);
}

function toUTC(date) {
  return dayjs(date).utc();
}

function formatDateTime(date) {
  return toBogota(date).format('DD/MM/YYYY HH:mm');
}

function formatDate(date) {
  return toBogota(date).format('DD/MM/YYYY');
}

function formatTime(date) {
  return toBogota(date).format('HH:mm');
}

module.exports = {
  dayjs,
  TZ,
  nowBogota,
  toBogota,
  toUTC,
  formatDateTime,
  formatDate,
  formatTime,
};
