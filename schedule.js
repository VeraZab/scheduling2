const path = require("path");
const fs = require("node:fs/promises");

const patientsDir = path.join(__dirname, "patients");
const practitionersDir = path.join(__dirname, "practitioners");

const readDir = async (location) => {
  const files = await fs.readdir(location);
  const fullContent = [];

  for (let i = 0; i < files.length; i++) {
    const filePath = path.join(location, files[i]);
    const fileContent = await fs.readFile(filePath, "utf-8");
    fullContent.push(JSON.parse(fileContent));
  }

  return fullContent;
};

const extractAvailabilities = (people) => {
  return people.reduce((agg, curr) => {
    const availabilities = curr.availabilities;
    Object.entries(availabilities).forEach(([day, shifts]) => {
      Object.entries(shifts).forEach(([shift, availability]) => {
        if (availability) {
          agg.push({
            name: curr.name,
            day,
            shift,
          });
        }
      });
    });
    return agg;
  }, []);
};

const sortAvailabilities = (availabilities) => {
  const sorted = [];
  ["1", "2", "3", "4", "5"].forEach((day) => {
    ["1", "2"].forEach((shift) => {
      const peopleAvailable = availabilities.filter(
        (a) => a.day === day && a.shift === shift
      );
      sorted.push(...peopleAvailable);
    });
  });
  return sorted;
};

const makeSchedule = (practitionerAvailabilities, patientsAvailabilities) => {
  const sortedPractitionerAvailabilities = sortAvailabilities(
    practitionerAvailabilities
  );
  let copyPatientsAvailabilities = [...patientsAvailabilities];
  const schedule = {};

  sortedPractitionerAvailabilities.forEach((av) => {
    const firstPatientAvailable = copyPatientsAvailabilities.find(
      (p) => p.day === av.day && p.shift === av.shift
    );
    if (firstPatientAvailable) {
      if (!schedule[av.day]) {
        schedule[av.day] = {};
      }
      if (!schedule[av.day][av.shift]) {
        schedule[av.day][av.shift] = [];
      }
      schedule[av.day][av.shift].push({
        patient: firstPatientAvailable.name,
        practitioner: av.name,
      });
      copyPatientsAvailabilities = copyPatientsAvailabilities.filter(
        (p) => p.name !== firstPatientAvailable.name
      );
    }
  });

  return { schedule, unscheduledPatients: copyPatientsAvailabilities };
};

const algo = async (patientsDir, practitionerDir) => {
  const patients = await readDir(patientsDir);
  const practitioners = await readDir(practitionerDir);
  const practitionerAvailabilities = extractAvailabilities(practitioners);
  const patientsAvailabilities = extractAvailabilities(patients);
  const { schedule } = makeSchedule(
    practitionerAvailabilities,
    patientsAvailabilities
  );
  return { schedule };
};

module.exports = {
  extractAvailabilities,
  sortAvailabilities,
  makeSchedule,
};
