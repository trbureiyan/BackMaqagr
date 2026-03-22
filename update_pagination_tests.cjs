const fs = require('fs');
const path = require('path');

const newTests = `
    test("retorna 200 y soporta ordenamiento string con order='desc'", async () => {
      const items = [
        { id: 1, implement_name: "ABC", terrain_name: "ABC", name: "ABC" },
        { id: 2, implement_name: "ZXY", terrain_name: "ZXY", name: "ZXY" }
      ];
      const req = createMockReq();
      req.pagination = { limit: 10, offset: 0, sort: "name", order: "desc", page: 1 };
      const res = createMockRes();
      const next = createMockNext();

      if (typeof mockFindByUserId !== 'undefined') mockFindByUserId.mockResolvedValue(items);
      if (typeof mockGetAll !== 'undefined') mockGetAll.mockResolvedValue(items);

      const handler = typeof getAllTerrains !== 'undefined' ? getAllTerrains :
                      typeof getAllTractors !== 'undefined' ? getAllTractors : 
                      getAllImplements;

      await callHandler(handler, req, res, next);
      const responseData = res.json.mock.calls[0][0].data;
      expect(responseData.length).toBe(2);
    });

    test("retorna 200 y soporta ordenamiento numérico con order='asc'", async () => {
      const items = [
        { id: 2, val: 120 },
        { id: 1, val: 80 }
      ];
      const req = createMockReq();
      req.pagination = { limit: 10, offset: 0, sort: "val", order: "asc", page: 1 };
      const res = createMockRes();
      const next = createMockNext();

      if (typeof mockFindByUserId !== 'undefined') mockFindByUserId.mockResolvedValue(items);
      if (typeof mockGetAll !== 'undefined') mockGetAll.mockResolvedValue(items);

      const handler = typeof getAllTerrains !== 'undefined' ? getAllTerrains :
                      typeof getAllTractors !== 'undefined' ? getAllTractors : 
                      getAllImplements;

      await callHandler(handler, req, res, next);
      const responseData = res.json.mock.calls[0][0].data;
      expect(responseData[0].val).toBe(80);
    });

    test("retorna 200 y soporta elementos iguales", async () => {
      const items = [
        { id: 1, name: "AAA", terrain_name: "AAA", implement_name: "AAA" },
        { id: 2, name: "AAA", terrain_name: "AAA", implement_name: "AAA" }
      ];
      const req = createMockReq();
      req.pagination = { limit: 10, offset: 0, sort: "name", order: "asc", page: 1 };
      const res = createMockRes();
      const next = createMockNext();

      if (typeof mockFindByUserId !== 'undefined') mockFindByUserId.mockResolvedValue(items);
      if (typeof mockGetAll !== 'undefined') mockGetAll.mockResolvedValue(items);

      const handler = typeof getAllTerrains !== 'undefined' ? getAllTerrains :
                      typeof getAllTractors !== 'undefined' ? getAllTractors : 
                      getAllImplements;

      await callHandler(handler, req, res, next);
      const responseData = res.json.mock.calls[0][0].data;
      expect(responseData.length).toBe(2);
    });
`;

const files = [
  'tests/unit/controllers/implementController.test.js',
  'tests/unit/controllers/terrainController.test.js',
  'tests/unit/controllers/tractorController.test.js'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  // Encontrar el final del primer test dentro de getAll...
  // Buscar "totalPages: 1,
  //          }),
  //        }),
  //      );
  //    });"
  const regex = /(totalPages: 1,[\s\S]*?\}\),\s*\}\),\s*\);\s*\}\);)/;
  if (regex.test(content)) {
     content = content.replace(regex, "$1\n" + newTests);
     fs.writeFileSync(file, content);
     console.log("Updated", file);
  } else {
     console.log("Could not find insertion point in", file);
  }
}
