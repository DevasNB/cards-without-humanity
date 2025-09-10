module.exports = {
    "frontend/**/*.{ts,js,html,css,scss}": [
        "prettier --write",
        "cd frontend && npm run lint --if-present"
    ],
    "backend/**/*.{ts,js,json,prisma}": [
        "prettier --write",
        "cd backend && npm run lint --if-present"
    ]
};
