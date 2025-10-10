module.exports = {
    branches: ['main'],
    plugins: [
        '@semantic-release/commit-analyzer', // Analyzes commit messages to determine the type of release
        '@semantic-release/release-notes-generator', // Generates release notes based on commit messages
        '@semantic-release/github', // Publishes release notes to GitHub
        '@semantic-release/git' // Commits the version bump and changelog to the repository
    ]
};
