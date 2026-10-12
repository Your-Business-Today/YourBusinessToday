const bodyFont = 'Calibri';
const inkColour = '1C1C1B';
const ruleColour = 'A9BAC7';
const normalStyleId = 'Normal';
const paragraphStyleType = 'paragraph';
const basedOnNormalXml = `<w:basedOn w:val="${normalStyleId}"/>`;

function headingStyleXml(level: number, sizeHalfPoints: number, spaceBeforeTwips: number): string {
	return `<w:style w:type="${paragraphStyleType}" w:styleId="Heading${level}"><w:name w:val="heading ${level}"/>
${basedOnNormalXml}<w:next w:val="${normalStyleId}"/><w:qFormat/>
<w:pPr><w:keepNext/><w:spacing w:before="${spaceBeforeTwips}" w:after="120"/><w:outlineLvl w:val="${level - 1}"/></w:pPr>
<w:rPr><w:b/><w:sz w:val="${sizeHalfPoints}"/></w:rPr></w:style>`;
}

const normalStyleXml = `<w:style w:type="${paragraphStyleType}" w:default="1" w:styleId="${normalStyleId}"><w:name w:val="${normalStyleId}"/><w:qFormat/>
<w:pPr><w:spacing w:after="120" w:line="276" w:lineRule="auto"/></w:pPr>
<w:rPr><w:rFonts w:ascii="${bodyFont}" w:hAnsi="${bodyFont}" w:cs="${bodyFont}"/><w:color w:val="${inkColour}"/><w:sz w:val="21"/></w:rPr></w:style>`;

const listStyleXml = `<w:style w:type="${paragraphStyleType}" w:styleId="ListParagraph"><w:name w:val="List Paragraph"/>
${basedOnNormalXml}<w:pPr><w:spacing w:after="60"/><w:ind w:left="567" w:hanging="283"/></w:pPr></w:style>`;

const quoteStyleXml = `<w:style w:type="${paragraphStyleType}" w:styleId="Quote"><w:name w:val="Quote"/>${basedOnNormalXml}
<w:pPr><w:pBdr><w:left w:val="single" w:sz="12" w:space="8" w:color="${ruleColour}"/></w:pBdr><w:ind w:left="340"/></w:pPr></w:style>`;

const ruleStyleXml = `<w:style w:type="${paragraphStyleType}" w:styleId="Rule"><w:name w:val="Rule"/>${basedOnNormalXml}
<w:pPr><w:pBdr><w:bottom w:val="single" w:sz="6" w:space="1" w:color="${ruleColour}"/></w:pBdr></w:pPr></w:style>`;

const tableBorder = (side: string) =>
	`<w:${side} w:val="single" w:sz="4" w:space="0" w:color="${ruleColour}"/>`;
const tableSides = ['top', 'left', 'bottom', 'right', 'insideH', 'insideV'];

const tableStyleXml = `<w:style w:type="table" w:styleId="TableGrid"><w:name w:val="Table Grid"/>
<w:pPr><w:spacing w:after="0"/></w:pPr>
<w:tblPr><w:tblBorders>${tableSides.map(tableBorder).join('')}</w:tblBorders>
<w:tblCellMar><w:top w:w="60" w:type="dxa"/><w:left w:w="100" w:type="dxa"/><w:bottom w:w="60" w:type="dxa"/><w:right w:w="100" w:type="dxa"/></w:tblCellMar></w:tblPr></w:style>`;

export const stylesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
${normalStyleXml}
${headingStyleXml(1, 36, 0)}
${headingStyleXml(2, 26, 280)}
${headingStyleXml(3, 22, 200)}
${listStyleXml}
${quoteStyleXml}
${ruleStyleXml}
${tableStyleXml}
</w:styles>`;
