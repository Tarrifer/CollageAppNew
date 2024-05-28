import React from "react";
import { ScrollView } from "react-native";
import EventTimetableScreen from "./EventTimetableScreen";
import StudentSubjectTimetableScreen from "./StudentSubjectTimetableScreen";

export function SundayScreen({ timetable }) {
  return (
    <ScrollView>
      <EventTimetableScreen dayIndex={0} timetable={timetable} />
      <StudentSubjectTimetableScreen dayIndex={0} timetable={timetable} />
    </ScrollView>
  );
}

export function MondayScreen({ timetable }) {
  return (
    <ScrollView>
      <EventTimetableScreen dayIndex={1} timetable={timetable} />
      <StudentSubjectTimetableScreen dayIndex={1} timetable={timetable} />
    </ScrollView>
  );
}

export function TuesdayScreen({ timetable }) {
  return (
    <ScrollView>
      <EventTimetableScreen dayIndex={2} timetable={timetable} />
      <StudentSubjectTimetableScreen dayIndex={2} timetable={timetable} />
    </ScrollView>
  );
}

export function WednesdayScreen({ timetable }) {
  return (
    <ScrollView>
      <EventTimetableScreen dayIndex={3} timetable={timetable} />
      <StudentSubjectTimetableScreen dayIndex={3} timetable={timetable} />
    </ScrollView>
  );
}

export function ThursdayScreen({ timetable }) {
  return (
    <ScrollView>
      <EventTimetableScreen dayIndex={4} timetable={timetable} />
      <StudentSubjectTimetableScreen dayIndex={4} timetable={timetable} />
    </ScrollView>
  );
}

export function FridayScreen({ timetable }) {
  return (
    <ScrollView>
      <EventTimetableScreen dayIndex={5} timetable={timetable} />
      <StudentSubjectTimetableScreen dayIndex={5} timetable={timetable} />
    </ScrollView>
  );
}

export function SaturdayScreen({ timetable }) {
  return (
    <ScrollView>
      <EventTimetableScreen dayIndex={6} timetable={timetable} />
      <StudentSubjectTimetableScreen dayIndex={6} timetable={timetable} />
    </ScrollView>
  );
}
