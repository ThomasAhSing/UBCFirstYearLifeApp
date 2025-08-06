import 'dotenv/config';

export default {
  expo: {
    name: "UBCFirstYearLifeApp",
    slug: "ubcfirstyearlifeapp",
    extra: {
      ADMIN_PASSCODE: process.env.ADMIN_PASSCODE,
    }
  }
};
