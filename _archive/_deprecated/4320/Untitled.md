Can you make a pure functional typescript edge n-gram tokenizer using nodejs Buffers
and Atomics

```js
"min_gram": 2, "max_gram": 10, "token_chars": [ "letter", "digit" ]
```

Here are some types I drew up

```js
export enum PredicateType {
    ,META,
    ,BLOB,
    ,POSTULATE // string[];
    ,AXIOM // string;
    ,DECLARATION // [string[],string[],string[],string[]];
    ,DEFINITION // [string[],string[],string[],string[]];
    ,PRINCIPLE // number;
    ,DISCOVERY // Delineates
    ,IDEAL // [PRINCIPLE,POSTULATE[]];
    ,METRIC // [PRINCIPLE,PRINCIPLE[]];
    ,MNEUMONIC // [POSTULATES,PRINCIPLE[]];
    ,BOUNDRY // [IDEAL,[number,number],[number,number]];
    ,CONSTRAINT // [IDEAL,[number,number,number,number]];
    ,POSE // Blob[];
    ,MACRO                              ,BLOCK_DESIGN                      }
```


Here is a more complete example interface , but I want edge n grams

```
 
 
 
Skip navigation links
Overview
Package
Class
Use
Tree
Deprecated
Index
Help
Summary:

Nested
Field
Constr
Method
Detail:

Field
Constr
Method
SEARCH 
Search
Package org.apache.lucene.analysis.path
Class ReversePathHierarchyTokenizer
java.lang.Object
org.apache.lucene.util.AttributeSource
org.apache.lucene.analysis.TokenStream
org.apache.lucene.analysis.Tokenizer
org.apache.lucene.analysis.path.ReversePathHierarchyTokenizer
All Implemented Interfaces:
Closeable, AutoCloseable
public class ReversePathHierarchyTokenizer
extends Tokenizer
Tokenizer for domain-like hierarchies.
Take something like:

 www.site.co.uk
 
and make:
 www.site.co.uk
 site.co.uk
 co.uk
 uk
 
Nested Class Summary Link icon
Nested classes/interfaces inherited from class org.apache.lucene.util.AttributeSource Link icon
AttributeSource.State
Field Summary Link icon
Fields
Modifier and Type
Field
Description
static final char
DEFAULT_DELIMITER
 
static final int
DEFAULT_SKIP
 
Fields inherited from class org.apache.lucene.analysis.Tokenizer Link icon
input
Fields inherited from class org.apache.lucene.analysis.TokenStream Link icon
DEFAULT_TOKEN_ATTRIBUTE_FACTORY
Constructor Summary Link icon
Constructors
Constructor
Description
ReversePathHierarchyTokenizer()
 
ReversePathHierarchyTokenizer(char delimiter, char replacement)
 
ReversePathHierarchyTokenizer(char delimiter, char replacement, int skip)
 
ReversePathHierarchyTokenizer(char delimiter, int skip)
 
ReversePathHierarchyTokenizer(int skip)
 
ReversePathHierarchyTokenizer(int bufferSize, char delimiter)
 
ReversePathHierarchyTokenizer(int bufferSize, char delimiter, char replacement)
 
ReversePathHierarchyTokenizer(int bufferSize, char delimiter, char replacement, int skip)
 
ReversePathHierarchyTokenizer(AttributeFactory factory, char delimiter, char replacement, int skip)
 
ReversePathHierarchyTokenizer(AttributeFactory factory, int bufferSize, char delimiter, char replacement, int skip)
 
Method Summary Link icon
All MethodsInstance MethodsConcrete Methods
Modifier and Type
Method
Description
final void
end()
 
final boolean
incrementToken()
 
void
reset()
 
Methods inherited from class org.apache.lucene.analysis.Tokenizer Link icon
close, correctOffset, setReader, setReaderTestPoint
Methods inherited from class org.apache.lucene.util.AttributeSource Link icon
addAttribute, addAttributeImpl, captureState, clearAttributes, cloneAttributes, copyTo, endAttributes, equals, getAttribute, getAttributeClassesIterator, getAttributeFactory, getAttributeImplsIterator, hasAttribute, hasAttributes, hashCode, reflectAsString, reflectWith, removeAllAttributes, restoreState, toString
Methods inherited from class java.lang.Object Link icon
clone, finalize, getClass, notify, notifyAll, wait, wait, wait
Field Details Link icon
DEFAULT_DELIMITER Link icon
public static final char DEFAULT_DELIMITER
See Also:
Constant Field Values
DEFAULT_SKIP Link icon
public static final int DEFAULT_SKIP
See Also:
Constant Field Values
Constructor Details Link icon
ReversePathHierarchyTokenizer Link icon
public ReversePathHierarchyTokenizer()
ReversePathHierarchyTokenizer Link icon
public ReversePathHierarchyTokenizer(int skip)
ReversePathHierarchyTokenizer Link icon
public ReversePathHierarchyTokenizer(int bufferSize,
 char delimiter)
ReversePathHierarchyTokenizer Link icon
public ReversePathHierarchyTokenizer(char delimiter,
 char replacement)
ReversePathHierarchyTokenizer Link icon
public ReversePathHierarchyTokenizer(int bufferSize,
 char delimiter,
 char replacement)
ReversePathHierarchyTokenizer Link icon
public ReversePathHierarchyTokenizer(char delimiter,
 int skip)
ReversePathHierarchyTokenizer Link icon
public ReversePathHierarchyTokenizer(char delimiter,
 char replacement,
 int skip)
ReversePathHierarchyTokenizer Link icon
public ReversePathHierarchyTokenizer(AttributeFactory factory,
 char delimiter,
 char replacement,
 int skip)
ReversePathHierarchyTokenizer Link icon
public ReversePathHierarchyTokenizer(int bufferSize,
 char delimiter,
 char replacement,
 int skip)
ReversePathHierarchyTokenizer Link icon
public ReversePathHierarchyTokenizer(AttributeFactory factory,
 int bufferSize,
 char delimiter,
 char replacement,
 int skip)
Method Details Link icon
incrementToken Link icon
public final boolean incrementToken()
                             throws IOException
Specified by:
incrementToken in class TokenStream
Throws:
IOException
end Link icon
public final void end()
               throws IOException
Overrides:
end in class TokenStream
Throws:
IOException
reset Link icon
public void reset()
           throws IOException
Overrides:
reset in class Tokenizer
Throws:
IOException
Copyright © 2000-2024 Apache Software Foundation. All Rights Reserved.


```