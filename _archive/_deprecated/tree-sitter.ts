const Parser = require('tree-sitter');
const JavaScript = require('tree-sitter-javascript');

const parser = new Parser();
parser.setLanguage(JavaScript);

(async () => {

    const sourceCode = 'let x = 1; console.log(x);';
    const tree = parser.parse(sourceCode);
    console.log(tree.rootNode.toString());

    // (program
    //   (lexical_declaration
    //     (variable_declarator (identifier) (number)))
    //   (expression_statement
    //     (call_expression
    //       (member_expression (identifier) (property_identifier))
    //       (arguments (identifier)))))

    const callExpression = tree.rootNode.child(1).firstChild;
    console.log(callExpression);

    // {
    //   type: 'call_expression',
    //   startPosition: {row: 0, column: 16},
    //   endPosition: {row: 0, column: 30},
    //   startIndex: 0,
    //   endIndex: 30
    // }
    // In the code, we replaced 'let' with 'const'.
    // So, we set our old end index to 3, and our new end index to 5.
    // Note that the end index is exclusive.
    const newSourceCode = 'const x = 1; console.log(x);';
    //                        ^ ^
    // indices:               3 5
    // points:            (0,3) (0,5)

    tree.edit({
        startIndex: 0,
        oldEndIndex: 3,
        newEndIndex: 5,
        startPosition: { row: 0, column: 0 },
        oldEndPosition: { row: 0, column: 3 },
        newEndPosition: { row: 0, column: 5 },
    });

    const newTree = parser.parse(newSourceCode, tree);

    // If your text is stored in a data structure other than a single string, such as a rope or array, you can parse it by supplying a callback to parse instead of a string:

    const sourceLines = [
        'let x = 1;',
        'console.log(x);'
    ];

    const nestedTree = parser.parse((index:input: string | Input, position): Tree => {
        let line = sourceLines[position.row];
        if (line) {
            return line.slice(position.column);
        }
    });
})();