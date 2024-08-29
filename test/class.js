// UniversityStudent class declaration
class UniversityStudent {
  constructor() {
    this.studentID = "UNI_ID_001";
  }

  set studentName(studentName) {
    this._studentName = studentName;
  }

  get studentName() {
    return this._studentName;
  }

  greetStudent() {
    console.log(
      "Hello, " + this.studentName + "! Your university ID is " + this.studentID
    );
  }
}
