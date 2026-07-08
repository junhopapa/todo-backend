 express = require("express");
const Todo = require("../models/Todo");

const router = express.Router();

function formatTask(task) {
  return {
    id: task._id.toString(),
    title: task.title,
    category: task.category,
    date: task.date,
    time: task.time,
    repeat: task.repeat,
    note: task.note,
    completed: task.completed,
    createdAt: task.createdAt.getTime(),
  };
}

router.get("/", async (req, res) => {
  try {
    const tasks = await Todo.find().sort({ createdAt: -1 });
    res.json(tasks.map(formatTask));
  } catch (err) {
    res.status(500).json({ message: "할 일 목록을 불러오지 못했습니다." });
  }
});

router.post("/", async (req, res) => {
  try {
    const { title, category, date, time, repeat, note } = req.body;

    const task = await Todo.create({
      title,
      category,
      date,
      time: time || "",
      repeat: repeat || "none",
      note: note || "",
    });

    res.status(201).json(formatTask(task));
  } catch (err) {
    if (err.name === "ValidationError") {
      const message = Object.values(err.errors)
        .map((e) => e.message)
        .join(", ");
      return res.status(400).json({ message });
    }

    res.status(500).json({ message: "할 일 생성에 실패했습니다." });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { title, category, date, time, repeat, note, completed } = req.body;

    const update = {
      title,
      category,
      date,
      time: time || "",
      repeat: repeat || "none",
      note: note || "",
    };

    if (typeof completed === "boolean") {
      update.completed = completed;
    }

    const task = await Todo.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    });

    if (!task) {
      return res.status(404).json({ message: "할 일을 찾을 수 없습니다." });
    }

    res.json(formatTask(task));
  } catch (err) {
    if (err.name === "ValidationError") {
      const message = Object.values(err.errors)
        .map((e) => e.message)
        .join(", ");
      return res.status(400).json({ message });
    }

    if (err.name === "CastError") {
      return res.status(404).json({ message: "할 일을 찾을 수 없습니다." });
    }

    res.status(500).json({ message: "할 일 수정에 실패했습니다." });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const task = await Todo.findByIdAndDelete(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "할 일을 찾을 수 없습니다." });
    }

    res.json({ message: "할 일이 삭제되었습니다." });
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(404).json({ message: "할 일을 찾을 수 없습니다." });
    }

    res.status(500).json({ message: "할 일 삭제에 실패했습니다." });
  }
});

module.exports = router;