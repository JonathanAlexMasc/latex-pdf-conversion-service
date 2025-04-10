const express = require("express");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

const app = express();
app.use(express.json());

app.post("/compile", async (req, res) => {
    const texContent = req.body.tex;
    const outputDir = "/data";
    const texPath = path.join(outputDir, "resume.tex");

    fs.writeFileSync(texPath, texContent);

    exec(
        `pdflatex -output-directory=${outputDir} -interaction=nonstopmode ${texPath}`,
        { cwd: outputDir },
        (err, stdout, stderr) => {
            if (err) {
                console.error(stderr);
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
