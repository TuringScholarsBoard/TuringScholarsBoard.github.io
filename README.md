# Turing Scholars Website

The official website for the Turing Scholars Program at the University of Texas at Austin.

## Contributing

Submit all changes through a pull request. Before you open one, test your changes and make sure they don't break existing functionality.

## Editing Website Data

Website content like sponsors, board members, and events is stored in JSON files in the `/data` directory. This keeps content separate from the code, so you can update it without touching the JavaScript, animations, styling, or page layouts.

To update content, find the matching JSON file and edit it. The `README.md` in the `/assets` directory documents the structure of each JSON object and how to update it.

### JSON Parsing

Each page has JavaScript that reads its JSON data and renders the content on the page.

**Important: if you change the structure of a JSON object, you must update its JavaScript parser too.** Renaming properties, removing required fields, or restructuring objects without updating the parser can break components or make them display incorrectly.

When editing JSON files:

- Keep the existing property names and object structures.
- Follow the formatting and conventions already used in the file.
- Include all required fields.
- Check that your JSON syntax is valid before submitting.
- If you need to change the structure, update and test the parser as well.

## Editing Layout and Styling

Changing the site's appearance or behavior takes more familiarity with its HTML, CSS, and JavaScript. Layout, animation, component, and style changes can affect several parts of the site, so review the relevant code and test at different screen sizes before submitting a pull request.

Follow the existing design conventions and reuse existing styles and components where you can. `styles.css` is the main stylesheet. Check it before making any major design change that affects the whole site.

The utils folder has images of each design, which were used as references when building the site. Most of the CSS was AI-generated.

## Contact

This website was built and last updated by Katherine Zhang (Turing class of 2030). For questions, email katherinezhang2236@gmail.com.