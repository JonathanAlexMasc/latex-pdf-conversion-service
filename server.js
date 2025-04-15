const express = require("express");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

const app = express();
app.use(express.json());

app.post("/compile", async (req, res) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (token !== process.env.NEXT_PUBLIC_LATEX_AUTH_TOKEN) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const texContent = req.body.tex;
    const outputDir = "/data";
    const texPath = path.join(outputDir, "resume.tex");

    try {
        fs.writeFileSync(texPath, texContent);
    } catch (err) {
        console.error("Failed to write .tex file:", err);
        return res.status(500).send("Error writing .tex file");
    }

    exec(
        `pdflatex -output-directory=${outputDir} -interaction=nonstopmode ${texPath}`,
        { cwd: outputDir },
        (err, stdout, stderr) => {
            if (err) {
                console.error("LaTeX compilation error:", stderr);
                return res.status(500).send("Failed to compile PDF");
            }

            const pdfPath = path.join(outputDir, "resume.pdf");
            if (fs.existsSync(pdfPath)) {
                const file = fs.readFileSync(pdfPath);
                res.setHeader("Content-Type", "application/pdf");
                return res.send(file);
            }

            res.status(500).send("PDF not found after compilation");
        }
    );
});

app.get("/", (_, res) => res.send("LaTeX PDF microservice is running"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
