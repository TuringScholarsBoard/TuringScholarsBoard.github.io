# Turing Scholars Website

This repository contains the official website for the Turing Scholars Program at the University of Texas at Austin.

## Contributing

All changes to the website should be submitted through a pull request. Please ensure that your changes are tested and do not interfere with existing functionality before submitting them for review.

## Editing Website Data

Updating website content is straightforward. Navigate to the `/data` directory and locate the corresponding JSON file.

Website content is stored in JSON files to simplify data management and separate content from presentation logic. This modular approach allows contributors to update static information, such as sponsors, board members, and events, without modifying the underlying JavaScript, animations, styling, or page layouts.

For detailed documentation on each JSON object's structure and instructions for updating the data, refer to the separate `README.md` located in the `/data` directory.

### JSON Parsing

Each page contains JavaScript responsible for parsing its corresponding JSON data and dynamically rendering the relevant content.

**IMPORTANT: Do not modify the structure of a JSON object without updating its corresponding JavaScript parser.**

Changing property names, removing required fields, or restructuring objects without updating the parser may cause website components to break or display incorrectly.

When editing JSON files:

- Preserve existing property names and object structures.
- Follow the formatting and conventions established in the file.
- Ensure that all required fields are included.
- Validate your JSON syntax before submitting changes.
- If structural changes are necessary, update and test the corresponding parser.

## Editing Website Layout and Styling

Modifying the website's appearance or functionality requires a greater understanding of its HTML, CSS, and JavaScript structure.

Unlike content updates, changes to layouts, animations, components, or styling may affect multiple parts of the website. Contributors should review the relevant code and test their changes across different screen sizes before submitting a pull request.

For consistency, please follow existing design conventions and reuse established styles and components whenever possible.

In the utils section, there are images of each design used as reference when coding the website. Most of the CSS code is AI-Generated. 