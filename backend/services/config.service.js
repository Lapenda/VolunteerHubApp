import fs from "fs";
import ini from "ini";
import path from "path";

const configPath = path.join(process.cwd(), "config.ini");

// Read config file
export const getConfig = () => {
  try {
    const configData = fs.readFileSync(configPath, "utf-8");
    return ini.parse(configData);
  } catch (error) {
    console.error("Error reading config: ", error);
    throw new Error(`Failed to read config file: ${error.message}`);
  }
};

//Update config file
export const updateConfig = (section, key, value) => {
  try {
    if (
      section == "server" &&
      key == "port" &&
      !Number.isInteger(Number(value))
    ) {
      throw new Error("Port must be a valid number");
    }

    const config = getConfig();
    if (!config[section]) {
      config[section] = {};
    }
    config[section][key] = value;
    fs.writeFileSync(configPath, ini.stringify(config));
    return true;
  } catch (error) {
    console.error("Error updating config: ", error);
    return false;
  }
};
