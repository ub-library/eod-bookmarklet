import * as config from "../config.json";
import { form } from "./form.js";
form({ ...config, ...config.overrides.some_vendor });
