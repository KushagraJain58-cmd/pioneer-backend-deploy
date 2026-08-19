/**
 * Import careers + industries from careers.xlsx
 *
 * Sheet "Careers by Sector" drives both collections:
 *   - every distinct `Sector` becomes an Industry document
 *   - every row becomes a Career, linked to its industry via `industryId`
 *     (the `industry` name is also stored, denormalised, for older clients)
 *
 * Run:  node careersImport.js          (upsert, keeps existing docs)
 *       node careersImport.js --fresh  (wipe careers first, then import)
 */
const mongoose = require("mongoose");
const XLSX = require("xlsx");
const Career = require("./src/models/career.model");
const Industry = require("./src/models/industry.model");

const MONGO_URI = "mongodb+srv://jainkushagra582_db_user:1JKIM9e3SRRxFaHw@pioneer.ghrhbwv.mongodb.net/";
const DB_NAME = "pioneer";

const EXCEL_FILE = "./careers.xlsx";
const SHEET_NAME = "Careers by Sector";
const FRESH = process.argv.includes("--fresh");

/* ----------------------------------
   HELPER FUNCTIONS
-----------------------------------*/

const str = (value) =>
  value === undefined || value === null ? "" : String(value).trim();

// Split by comma
const splitComma = (value) => {
  return str(value).split(",").map((v) => v.trim()).filter(Boolean);
};

// Split by semicolon
const splitSemiColan = (value) => {
  return str(value).split(";").map((v) => v.trim()).filter(Boolean);
};

// Split by dot (for sentences)
const splitDot = (value) => {
  return str(value).split(".").map((v) => v.trim()).filter(Boolean);
};

/* ----------------------------------
   INDUSTRIES
   One document per distinct Sector.
-----------------------------------*/
async function importIndustries(rows) {
  const names = [...new Set(rows.map((row) => str(row["Sector"])).filter(Boolean))];

  for (const name of names) {
    await Industry.updateOne(
      { name },
      { $setOnInsert: { name } },
      { upsert: true }
    );
  }

  const industries = await Industry.find({ name: { $in: names } }).lean();

  // name -> _id lookup used when building careers
  const idByName = industries.reduce((acc, i) => {
    acc[i.name] = i._id;
    return acc;
  }, {});

  console.log(`🏭 Industries in DB for this sheet: ${industries.length} / ${names.length}`);
  return idByName;
}

/* ----------------------------------
   CAREERS
-----------------------------------*/
async function importCareers() {
  try {
    await mongoose.connect(MONGO_URI + DB_NAME);
    console.log("✅ MongoDB Connected");

    /* ----------------------------------
       READ EXCEL
    -----------------------------------*/
    const workbook = XLSX.readFile(EXCEL_FILE);
    const sheet = workbook.Sheets[SHEET_NAME];
    if (!sheet) {
      throw new Error(
        `Sheet "${SHEET_NAME}" not found. Available: ${workbook.SheetNames.join(", ")}`
      );
    }
    const rows = XLSX.utils.sheet_to_json(sheet);
    console.log(`📄 Rows found: ${rows.length}`);

    /* ----------------------------------
       INDUSTRIES FIRST — careers need their ids
    -----------------------------------*/
    const industryIdByName = await importIndustries(rows);

    /* ----------------------------------
       TRANSFORM DATA
    -----------------------------------*/
    const formattedData = rows.map((row) => {
      const industry = str(row["Sector"]);

      return {
        title: str(row["Career"]),
        industry,
        industryId: industryIdByName[industry] || null,
        description: str(row["Description"]),
        progression: str(row["Career progression"]),
        educationPath: str(row["Education_Path"]),
        keySkills: splitComma(row["Key_Skills"]),
        topInstitutionsIndia: splitSemiColan(row["Colleges India"]),
        globalPathways: splitSemiColan(row["Abroad"]),

        exposure: splitComma(row["Exposure"]),
        whatYouActuallyDo: splitDot(row["What You Actually Do"]),
        entranceExams: splitSemiColan(row["Entrance Exam"]),
        scholarships: splitSemiColan(row["Scholarships"]),
        lateralOptions: splitComma(row["Lateral Options"]),
        adjacentRoles: splitComma(row["Adjacent Roles"]),
        whoShouldNotChoose: str(row["Who Should Not Choose"]),

        isDeleted: false
      };
    });

    /* ----------------------------------
       REMOVE INVALID ROWS
       (description + progression are required by the schema)
    -----------------------------------*/
    const cleanData = formattedData.filter(
      (item) =>
        item.title && item.industry && item.description && item.progression
    );
    const skipped = formattedData.length - cleanData.length;
    console.log(`✅ Valid rows: ${cleanData.length}${skipped ? ` (skipped ${skipped})` : ""}`);

    /* ----------------------------------
       OPTIONAL WIPE
    -----------------------------------*/
    if (FRESH) {
      const { deletedCount } = await Career.deleteMany({});
      console.log(`🗑️  Deleted ${deletedCount} existing careers`);
    }

    /* ----------------------------------
       UPSERT (NO DUPLICATES)
       `isSelected` is user data — only set on insert.
    -----------------------------------*/
    const ops = cleanData.map((item) => ({
      updateOne: {
        filter: { title: item.title },
        update: { $set: item, $setOnInsert: { isSelected: false } },
        upsert: true
      }
    }));

    const result = await Career.bulkWrite(ops, { ordered: false });
    console.log(
      `🚀 Careers — inserted: ${result.upsertedCount}, updated: ${result.modifiedCount}`
    );

    /* ----------------------------------
       BACKFILL: link any pre-existing career
       that still has no industryId
    -----------------------------------*/
    let linked = 0;
    for (const [name, id] of Object.entries(industryIdByName)) {
      const res = await Career.updateMany(
        { industry: name, industryId: null },
        { $set: { industryId: id } }
      );
      linked += res.modifiedCount;
    }
    if (linked) console.log(`🔗 Linked ${linked} pre-existing careers to their industry`);

    process.exit();
  } catch (error) {
    console.error("❌ Import error:", error);
    process.exit(1);
  }
}

importCareers();
