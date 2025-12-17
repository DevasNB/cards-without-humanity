module.exports = {
    "frontend/**/*.{ts,js,html,css,scss}": [
        "prettier --write",
        "npm --prefix frontend run lint --if-present"
    ],
    "backend/**/*.{ts,js,json,prisma}": [
        "prettier --write",
        "npm --prefix backend run lint --if-present"
    ],
    "shared/**/*.{ts,js,json,prisma}": [
        "prettier --write",
        "npm --prefix backend run lint --if-present"
    ]
};
