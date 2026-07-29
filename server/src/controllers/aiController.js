const { query } = require("../config/db");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const ai = require("../services/aiService");
const { emitToBoard, logActivity } = require("../realtime");

const generateTasks = asyncHandler(async (req, res) => {
    const goal = (req.body.goal || "").trim();
    if (!goal) throw ApiError.badRequest("Project goal is required");
    const count = Math.min(Math.max(parseInt(req.body.count, 10) || 6, 1), 15);

    const suggestions = await ai.generateTasks(goal, count);

    if (!req.body.column_id) {
        return res.json({ tasks: suggestions, persisted: false });
    }

    const colRes = await query("SELECT id FROM columns WHERE id = $1 AND board_id = $2", [
        req.body.column_id,
        req.board.id
    ]);
    if (!colRes.row.length) throw ApiError.badRequest("column_id does not belong to this board");

    const baseRes = await query(
        "SELECT COALESCE(MAX(position), 0) AS pos FROM tasks WHERE column_id = $1",
        [req.body.column_id]
    );
    let pos = Number(baseRes.rows[0].pos);
    const created = [];

    for (const s of suggestions) {
        pos += 1000;
        const { rows } = await query(
            `INSERT INTO tasks (board_id, column_id, title, description, priority, position, created_by)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *`,
            [req.board.id, req.body.column_id, s.title, s.description, s.priority, pos, req.user.id]
        );
        created.push(rows[0]);
        emitToBoard(req.board.id, "task:created", rows[0]);
    }

    await logActivity({
        boardId: req.board.id,
        userId: req.user.id,
        action: "ai.generated_tasks",
        message: `${req.user.name} generated ${created.length} tasks using AI`,
        metadata: { goal, count: created.length },
    });
    
    res.status(201).json({ tasks: created, persisted: true });
});
