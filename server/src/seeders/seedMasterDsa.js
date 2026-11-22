import "dotenv/config";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import mongoose from "mongoose";
import { Sheet } from "../models/sheet.models.js";
import { SheetQuestion } from "../models/sheetQuestion.models.js";
import { SheetTopic } from "../models/sheetTopic.models.js";

const dataUrl = new URL("./data/master-dsa.json", import.meta.url);

// Keep IDs stable across imports so saved progress continues to reference the same rows.
function importId(slug, kind, key) {
  const hex = createHash("sha256").update(`${slug}:${kind}:${key}`).digest("hex");
  return new mongoose.Types.ObjectId(hex.slice(0, 24));
}

async function seedCourse({ slug, name, description, source, topics }) {
  const sheet = await Sheet.findOneAndUpdate(
    { slug },
    { $set: { name, description, source } },
    { upsert: true, returnDocument: "after" },
  );

  const topicIds = new Map(
    topics.map(({ code }) => [code, importId(slug, "topic", code)]),
  );
  await SheetTopic.bulkWrite(
    topics.map(({ code, name }, order) => ({
      updateOne: {
        filter: { _id: topicIds.get(code) },
        update: {
          $set: {
            sheetId: sheet._id,
            parentTopicId: topicIds.get(code.split(".").slice(0, -1).join(".")) ?? null,
            code,
            name,
            order,
          },
        },
        upsert: true,
      },
    })),
  );

  const questions = topics.flatMap(({ code, questions }) =>
    questions.map(({ row, title, links }, order) => ({
      updateOne: {
        filter: { _id: importId(slug, "question", row) },
        update: { $set: { sheetId: sheet._id, topicId: topicIds.get(code), title, links, order } },
        upsert: true,
      },
    })),
  );
  await SheetQuestion.bulkWrite(questions);
  await Sheet.updateOne({ _id: sheet._id }, { $set: { totalQuestions: questions.length } });
  console.log(`${name}: ${questions.length} questions across ${topics.length} sections and parts`);
}

try {
  const courses = JSON.parse(await readFile(dataUrl, "utf8"));
  if (!process.env.MONGO_URL) throw new Error("MONGO_URL is required");
  await mongoose.connect(process.env.MONGO_URL, { serverSelectionTimeoutMS: 10000 });
  for (const course of courses) await seedCourse(course);
} catch (error) {
  console.error(`Master DSA seed failed (${error.code ?? error.name})`);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
