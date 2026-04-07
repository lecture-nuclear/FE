export const getLectureGridClass = (count) => {
  if (count <= 1) {
    return 'lecture-grid--1'
  }

  if (count === 2) {
    return 'lecture-grid--2'
  }

  if (count === 3) {
    return 'lecture-grid--3'
  }

  return 'lecture-grid--4plus'
}
