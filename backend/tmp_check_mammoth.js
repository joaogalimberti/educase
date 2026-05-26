import mammoth from 'mammoth';
import fs from 'fs';
import path from 'path';

const templatePath = 'c:/Users/joaog/OneDrive/Desktop/educase/backend/templates/certificado_modelo.docx';

async function main() {
    try {
        const result = await mammoth.convertToHtml({ path: templatePath });
        fs.writeFileSync('c:/Users/joaog/OneDrive/Desktop/educase/tmp_template.html', result.value);
        console.log('HTML saved to tmp_template.html');
        console.log('Messages:', result.messages);
    } catch (err) {
        console.error(err);
    }
}

main();
