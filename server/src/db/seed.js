require("dotenv").config();
const bcrypt = require("bcryptjs");
const { pool, withTransaction } = require("../config/db");
const PASSWORD = "Test@1234";
const DAY = 86400000;
const COLUMNS = ["Todo", "In Progress", "Review", "Done"];
const USERS = [
    { key: "alex", name: "Alex Rivera", email: "alex@spacecraft.com" },
    { key: "joe",  name: "Joe Doe",     email: "joe@spacecraft.com" },
    { key: "jane", name: "Jane Doe",    email: "jane@spacecraft.com" },
    { key: "john", name: "John Doe",    email: "john@spacecraft.com" },
    { key: "jane", name: "Jane Doe",    email: "jane@spacecraft.com" },
    { key: "nina", name: "Nina Doe",    email: "nina@spacecraft.com" },
];

const BOARDS = [
    {
        title: "Spacecraft",
        description: "Spacecraft is a platform for creating and managing your projects.",
        color: "#2f8159",
        owner: "alex",
        members: ["alex", "joe", "jane", "john", "nina"],
        updatedDaysAgo: 0.3,
        tasks: [
            "Define Q3 OKRs", "Prioritize tasks", "Assign tasks", "Review tasks", "Complete tasks",
            "Research market trends", "Competitor analysis", "Customer feedback", "Product roadmap", "Market research",
            "Business development", "Customer support", "Product development", "Marketing", "Sales",
            "Update project management tool", "Update documentation", "Update codebase", "Update UI/UX", "Update documentation",
        ],
    },
    {
        title: "Marketing",
        description: "Marketing is a platform for creating and managing your projects.",
        color: "#c26a45",
        owner: "joe",
        members: ["joe", "jane", "john", "nina"],
        updatedDaysAgo: 1.2,
        tasks: [
            "App store deploy app", "Campaign analytics", "Website update", "Social media posts", "Email campaigns",
            "Meta ads campaign", "Google ads campaign", "Email campaign", "Social media campaign", "Campaign analytics",
            "Bugs fixes", "Feature development", "Code review", "Deployment", "Maintenance",
        ],
    },
    {
        title: "Product",
        description: "Product is a platform for creating and managing your projects.",
        color: "#5f7da6",
        owner: "jane",
        members: ["jane", "john", "nina"],
        updatedDaysAgo: 2.6,
        tasks: [
            "Feature development", "Code review", "Deployment", "Maintenance",
            "Migrate blog to new platform", "Update blog content", "Update blog design", "Update blog functionality", "Update blog SEO",
        ],
    },
    {
        title: "Design",
        description: "Design is a platform for creating and managing your projects.",
        color: "#d4a23c",
        owner: "john",
        members: ["john", "nina"],
        updatedDaysAgo: 4,
        tasks: [
            "Wiredframe homepage", "Wiredframe about page", "Wiredframe contact page", "Wiredframe blog page", "Wiredframe portfolio page",
            "Enhanced UI/UX", "Enhanced performance", "Enhanced SEO", "Enhanced accessibility", "Enhanced security",
        ],
    },
    {
        title: "Development",
        description: "Development is a platform for creating and managing your projects.",
        color: "#2c9c8f",
        owner: "nina",
        members: ["nina"],
        updatedDaysAgo: 0.8,
        tasks: [
            "Feature development", "Code review", "Deployment", "Maintenance",
            "Fix the javascript bug", "Fix the css bug", "Fix the html bug", "Fix the react bug", "Fix the node bug",
        ],
    },
    {
        title: "QA",
        description: "QA is a platform for creating and managing your projects.",
        color: "#a05d7d",
        owner: "john",
        members: ["john"],
        updatedDaysAgo: 6,
        tasks: [
            "Smoke test", "Regression test", "Performance test", "Security test", "Load test",
        ],
    },

    {
        title: "Customer Support",
        description: "Customer Support is a platform for creating and managing your projects.",
        color: "#6f9b54",
        owner: "jane",
        members: ["jane", "john"],
        updatedDaysAgo: 1.8,
        tasks: [
            "Customer tickets", "Customer bugs", "Customer dev", "Customer appointments", "Customer tickets",
            "Data analysis", "Data visualization", "Data reporting", "Data insights", "Data insights",
            "Customer retention", "Customer acquisition", "Customer engagement", "Customer satisfaction", "Customer satisfaction",
        ],
    },
    {
        title: "Sales",
        description: "Sales is a platform for creating and managing your projects.",
        color: "#4f9d82",
        owner: "joe",
        members: ["joe", "jane", "john"],
        updatedDaysAgo: 2.4,
        tasks: [
            "Sales tickets", "Sales bugs", "Sales dev", "Sales appointments", "Sales tickets",
        ],
    },
];

const COL_CYCLE  = [0, 1, 1, 2, 3, 0, 2, 3, 1, 3, 0, 1];
const PRIO_CYCLE = ["medium", "high", "low", "urgent", "medium", "high", "low", "urgent"];
const DUE_CYCLE  = [-9, 2, null, 5, -2, 14, 1, null, 20, -4, 6, 9, 3, null, 12, -1, 7];

const run = async () => {
    await withTransaction(async (c) => {

        await c.query("DELETE FROM users WHERE email = ANY($1)", [
            USERS.map((u) => u.email.toLowerCase()),
        ]);

        const hash = await bcrypt.hash(PASSWORD, 10);
        const uid  = {};
        for (const u of USERS) {
            const { rows } = await c.query(
                `INSERT INTO users (name, email, password_hash, created_at)
                VALUES ($1, $2, $3, now() - interval '60 days') RETURNING id`,
                [u.name, u.email.toLowerCase(), hash],
            );
            uid[u.key] = rows[0].id;
        }

        let taskTotal = 0;

        for (const b of BOARDS) {
            const ownerId = uid[b.owner];
            const updatedAt = new Date(Date.now() - b.updatedDaysAgo * DAY);

            const { rows: br } = await c.query(
                `INSERT INTO boards (title, description, color, owner_id, created_at, updated_at)
                VALUES($1, $2, $3, $4, now() - interval '45 days', $5) RETURNING id`,
                [b.title, b.description, b.color, ownerId, updatedAt],
            );
            const boardId = br[0].id;

            let memberKeys = [b.owner, ...b.members];
            if (!memberKeys.includes("alex")) memberKeys.push("alex");
            memberKeys = [...new Set(memberKeys)];

            for (let mi=0; mi<memberKeys.length; mi++) {
                const mk = memberKeys[mi];
                const role = mk === b.owner ? "owner" : mi === 1 ? "admin" : "member";
                await c.query(
                    `INSERT INTO board_members (board_id, user_id, role)
                    VALUES($1, $2, $3) ON CONFLICT DO NOTHING`,
                    [boardId, uid[mk], role],
                );
            }

            const colIds = [];
            for (let i=0; i<COLUMNS.length; i++) {
                const { rows: cr } = await c.query(
                    `INSERT INTO columns (board_id, title, position) VALUES($1, $2, $3) RETURNING id`,
                    [boardId, COLUMNS[i], (i+1) * 1000]
                );
                colIds.push(cr[0].id);
            }

            const asssignPool = ["alex", "alex", ...memberKeys];

            for (let i=0; i<b.tasks.length; i++) {
                const colIdx = COL_CYCLE[i % COL_CYCLE.length];
                const priority = PRIO_CYCLE[(i + b.title.length) % PRIO_CYCLE.length];
                const offset = DUE_CYCLE[(i +b.tasks.length) % DUE_CYCLE.length];
                const dueDate = offset === null ? null : new Date(Date.now() + offset * DAY);
                const assigneeKey = i % 5 === 4 ? null : asssignPool[i % asssignPool.length];
                const assigneeId = assigneeKey ? uid[assigneeKey] : null;

                await c.query(
                    `INSERT INTO tasks 
                      (board_id, column_id, title, desciption, priority, due_date, assignee_id, position, created_at, updated_at)
                    VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, now() - interval '20 days', $10)`,
                    [
                        boardId,
                        colIds[colIdx],
                        b.tasks[i],
                        i % 3 === 0 ? `${b.tasks[i]} - details and acceptance criteria` : null,
                        priority,
                        dueDate,
                        assigneeId,
                        (i+1) * 1000,
                        ownerId,
                        updatedAt,
                    ]
                );
                taskTotal += 1;
            }

            const ownerName = USERS.find((u) => u.key === b.owner)?.name;
            const acts = [
                { action: "board.created", message: `${ownerName} created the board "${b.title}"`},
                { action: "task.created",  message: `${ownerName} added "${b.tasks[0]}"`},
                { action: "task.moved",    message: `${USERS.find((u) => u.key === memberKeys[1] || u.key === b.owner)?.name || ownerName} moved "${b.tasks[0]}" to "${COLUMNS[0]}"`},
            ];
            for (let ai=0; ai<acts.length; ai++) {
                await c.query(
                    `INSERT INTO activities (board_id, user_id, action, message, created_at)
                    VALUES($1, $2, $3, $4, now() - ($5 || ' hours')::interval)`,
                    [boardId, ownerId, acts[ai].action, acts[ai].message, ( ai + 1) * 7]
                );
            }
        }

        return taskTotal;
    }).then((taskTotal) => {
        console.log("Spacecraft seeded. ⭐");
        console.log(` Users: ${USERS.length}  - Boards: ${BOARDS.length}  - Tasks: ${taskTotal}`);
        console.log(" Login: alex@spacecraft.com / Test@1234");
        console.log(" Teammates share same password 🚀");
    });
};
