const _ = require('lodash');
const moment = require('moment');

exports.sanitize = (data) => {
  const sanitized = {};
  for ([key, value] of Object.entries(data)) {
    if (value) {
      sanitized[key] = _.escape(value).toLowerCase().trim();
    }
  }

  return sanitized;
};

exports.formatDateFromNow = (datetime) => {
  return moment(datetime).fromNow();
};

exports.formatDateTime = (datetime) => {
  return moment(datetime).format('LLL');
};

exports.splitDateTime = (datetime) => {
  let d = new Date(datetime);
  date = `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
  time = `${d.getHours()}:${d.getMinutes()}`;
  return {
    date,
    time,
    datetime: `${date} ${time}`,
  };
};

exports.timeDiff = (datetimeA, datetimeB) => {
  datetimeA = moment(datetimeA);
  datetimeB = moment(datetimeB);

  const timeDiff = moment.duration(datetimeA.diff(datetimeB));
  return `${timeDiff.hours()}:${timeDiff.minutes()}:${timeDiff.seconds()}`;
};

exports.voteCounter = (votes, totalVotes = {}) => {
  for (vote of votes) {
    let cid = vote.Candidate.id;

    if (totalVotes.hasOwnProperty(cid)) {
      totalVotes[cid]++;
    } else {
      totalVotes[cid] = 1;
    }
  }
  return totalVotes;
};
