import { model, Schema } from "mongoose";
import type { TaskPriority, TaskStatus } from "../types/task.js";

interface TaskMongo {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  tags: string[];
  dueDate?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<TaskMongo>(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, trim: true, maxlength: 2000 },
    status: {
      type: String,
      enum: ["todo", "in_progress", "done"],
      default: "todo"
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium"
    },
    tags: {
      type: [String],
      default: []
    },
    dueDate: { type: Date },
    completedAt: { type: Date }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

taskSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc, ret: { _id?: { toString: () => string }; id?: string; __v?: unknown }) => {
    if (!ret._id) {
      return;
    }
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
  }
});

export const TaskModel = model<TaskMongo>("Task", taskSchema);
