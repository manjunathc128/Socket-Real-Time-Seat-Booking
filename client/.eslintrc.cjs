

module.exports = {
    root: true,
    env: { browser: true, es2020: true },
    extends: [ 
        'eslint:recommended',
        '@typescript-eslint/recommended',
        'eslint:recommended'
     ],
     ignorePatterns: ['dist', '.eslintrc.cjs'],
     parser: '@typescript-eslint/parser',
     plugins: ['react-refresh'],
     rules: {
        'react-refresh/only-export-components' : [
            'warn',
            { allowConstantExport: true }
        ],
     },
     rules: {
        '@typescript-eslint/explicit-function-return-type': 'warn',
        '@typescript-eslint/no-explicit-any': 'warn',
        '@typescript-eslint/no-unused-vars': 'warn',
        
        // 'react-refresh/only-export-components' : [
        //     'warn',
        //     { allowConstantExport: true }
        // ],
     }
}