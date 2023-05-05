import slugify from "slugify";
import { nanoid } from "nanoid";

export const CategoryPostSlug = (name) => {
  const slug = slugify(name, {
    lower: true,
    strict: true,
    locale: "vi",
    remove: /[*+~.()'"!:@]/g,
  });
  return slug;
};

export const PostSlug = (title) => {
  const randomId = nanoid(10);
  const slug = slugify(title, {
    lower: true,
    strict: true,
    locale: "vi",
    remove: /[*+~.()'"!:@]/g,
  });
  return `${slug}-${randomId}`;
};

export const TagSlug = (name) => {
  const slug = slugify(name, {
    lower: true,
    strict: true,
    replacement: "",
    locale: "vi",
    remove: /[*+~.()'"!:@]/g,
  });
  return slug;
};
