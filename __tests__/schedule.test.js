const {
  extractAvailabilities,
  sortAvailabilities,
  makeSchedule,
} = require("../schedule");

const mockAnna = require("../patients/anna.json");
const mockBen = require("../patients/ben.json");
const mockC1 = require("../practitioners/1.json");
const mockC2 = require("../practitioners/2.json");

jest.mock("node:fs/promises");

test("extracts all timeslots person is available", () => {
  const availabilities = extractAvailabilities([mockAnna]);

  expect(availabilities).toEqual([
    { name: "anna", day: "1", shift: "1" },
    { name: "anna", day: "2", shift: "1" },
    { name: "anna", day: "3", shift: "1" },
    { name: "anna", day: "3", shift: "2" },
  ]);
});

test("sorts all people's availabilities according to most recent available", () => {
  const availabilities = extractAvailabilities([mockAnna, mockBen]);
  const sortedAvailabilities = sortAvailabilities(availabilities);

  expect(sortedAvailabilities).toEqual([
    { name: "anna", day: "1", shift: "1" },
    { name: "ben", day: "1", shift: "2" },
    { name: "anna", day: "2", shift: "1" },
    { name: "anna", day: "3", shift: "1" },
    { name: "anna", day: "3", shift: "2" },
  ]);
});

test("make schedule based on availabilities and return unassigned patients", () => {
  const practitionerAvailabilities = extractAvailabilities([mockC1, mockC2]);
  const patientsAvailabilities = extractAvailabilities([mockAnna, mockBen]);
  const { schedule, unscheduledPatients } = makeSchedule(
    practitionerAvailabilities,
    patientsAvailabilities
  );

  expect(schedule).toEqual({
    1: {
      1: [{ patient: "anna", practitioner: "p1" }],
    },
  });

  expect(unscheduledPatients).toEqual([
    {
      name: "ben",
      day: "1",
      shift: "2",
    },
  ]);
});
