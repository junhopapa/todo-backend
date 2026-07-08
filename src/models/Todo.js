const mongoose = require("mongoose");

// index.html 일일계획 입력 폼 기준
const CATEGORIES = ["estimate", "construction", "payment", "appointment", "study"];
const REPEATS = ["none", "daily", "weekly", "monthly"];

const todoSchema = new mongoose.Schema(
  {
    // 제목 (taskTitle)
    title: {
      type: String,
      required: [true, "제목은 필수입니다."],
      trim: true,
    },
    // 분류 (taskCategory)
    category: {
      type: String,
      required: [true, "분류는 필수입니다."],
      enum: {
        values: CATEGORIES,
        message: "분류는 견적, 시공, 입금, 약속, 공부 중 하나여야 합니다.",
      },
    },
    // 날짜 (taskDate) - YYYY-MM-DD
    date: {
      type: String,
      required: [true, "날짜는 필수입니다."],
      match: [/^\d{4}-\d{2}-\d{2}$/, "날짜 형식은 YYYY-MM-DD여야 합니다."],
    },
    // 시간 (taskTime) - HH:MM, 선택
    time: {
      type: String,
      default: "",
    },
    // 반복 (taskRepeat)
    repeat: {
      type: String,
      enum: {
        values: REPEATS,
        message: "반복은 none, daily, weekly, monthly 중 하나여야 합니다.",
      },
      default: "none",
    },
    // 메모 (taskNote) - 선택
    note: {
      type: String,
      default: "",
      trim: true,
    },
    // 완료 여부
    completed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    collection: "tasks",
  }
);

module.exports = mongoose.model("Todo", todoSchema);
