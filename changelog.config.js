const workspaces = Object.keys(require("./workspace.json").projects).map(p => "📦 " + p);

module.exports = {
	scopes: [...workspaces, "✨ general"],
};
