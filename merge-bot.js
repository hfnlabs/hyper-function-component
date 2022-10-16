const https = require("https");
const { existsSync } = require("fs");
const { resolve } = require("path");
const { execSync } = require("child_process");

const org = "hfnlabs";
const repos = [
  { name: "create-hfc", prefix: "create-hfc" },
  { name: "hfcpack", prefix: "hfcpack" },
];

(async () => {
  await Promise.all(
    repos.map(async (repo) => {
      const { name, prefix } = repo;
      const exists = existsSync(resolve(__dirname, prefix));

      const latestCommit = await getLatestCommit(name);
      if (!latestCommit) {
        console.error("fail to get latest commit msg: " + name);
        return;
      }

      const action = exists ? "pull" : "add";
      const command = `git subtree ${action} --prefix=${prefix} https://github.com/${org}/${name}.git main -m "${latestCommit.commit.message}"`;

      console.log("Run: " + command);
      const stdout = execSync(command);
      console.log(stdout.toString());
    })
  );

  const stdout = execSync("git push");
  console.log(stdout.toString());
})();

function getLatestCommit(repo) {
  return new Promise((resolve) => {
    https
      .get(
        `https://api.github.com/repos/${org}/${repo}/commits?per_page=1`,
        { headers: { "User-Agent": "hfnlabs" } },
        (resp) => {
          let data = "";

          resp.on("data", (chunk) => {
            data += chunk;
          });
          resp.on("end", () => {
            const commits = JSON.parse(data);
            resolve(commits && commits[0]);
          });
        }
      )
      .on("error", (err) => {
        console.log("Error: " + err.message);
        resolve(null);
      });
  });
}
