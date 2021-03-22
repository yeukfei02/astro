import type { Optimizer } from '../@types/optimizer';

export default function ({ filename, fileID }: { filename: string; fileID: string }): Optimizer {
  return {
    visitors: {
      html: {
        Element: {
          enter(node) {
            debugger;
            //console.log(JSON.stringify(node.attributes));
          }
        },
        InlineComponent: {
          enter(node) {
            if(!node.name.endsWith(':dynamic')) {
              return;
            }

            // TODO what type of thing is this?

            debugger;
            node.type = 'Element';
            node.name = 'preact-island';
            node.children = [];
            node.attributes = [
              {
                type: 'Attribute',
                name: 'component',
                value: [{
                  type: 'Text',
                  data: '',
                  raw: ''
                }]
              }
            ];

            //console.log(node);
          }
        }
      }
    },
    async finalize() {

    }
  }
}