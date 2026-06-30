function icon(name, size) {
    size = size || 24;
    return '<img src="assets/icons/your custom icons/' + name + '.svg" alt="" width="' + size + '" height="' + size + '" class="custom-icon" loading="lazy">';
}

var renderers = {};

renderers.hero = function(data) {
    var d = data.data;
    var badgeIcon = d.badge_icon ? icon(d.badge_icon, 15) + ' ' : '';
    var badge = d.badge ? '<div class="hero__badge">' + badgeIcon + escapeHTML(d.badge) + '</div>' : '';
    var accentSpan = d.accent ? ' <span>' + escapeHTML(d.accent) + '</span>' : '';
    var buttons = '';
    if (d.buttons && d.buttons.length) {
        buttons = '<div class="hero__actions">';
        d.buttons.forEach(function(btn) {
            var cls = btn.style === 'primary' ? 'btn btn--primary' : 'btn btn--outline';
            buttons += '<a class="' + cls + '" href="' + btn.url + '">' + escapeHTML(btn.label) + '</a>';
        });
        buttons += '</div>';
    }
    var img = d.image ? '<div class="hero__image-wrapper"><img class="hero__image" alt="' + escapeHTML(d.image_alt || '') + '" src="' + d.image + '" width="1024" height="686"></div>' : '';
    return '<section class="hero" id="' + data.id + '">' +
        badge +
        '<h1 class="hero__title">' + escapeHTML(d.name) + accentSpan + '</h1>' +
        (d.tagline ? '<h2 class="hero__subtitle">' + escapeHTML(d.tagline) + '</h2>' : '') +
        (d.description ? '<p class="hero__description">' + escapeHTML(d.description) + '</p>' : '') +
        buttons +
        img +
    '</section>';
};

renderers.about = function(data) {
    var d = data.data;
    var paras = '';
    if (d.paragraphs) {
        d.paragraphs.forEach(function(p) {
            paras += '<p>' + escapeHTML(p) + '</p>';
        });
    }
    var skillsHtml = '';
    if (d.skills && d.skills.length) {
        skillsHtml = '<div class="about__skills">';
        for (var i = 0; i < d.skills.length; i++) {
            var group = d.skills[i];
            skillsHtml += '<div class="about__skill-group">';
            if (group.category) skillsHtml += '<span class="about__skill-category">' + escapeHTML(group.category) + '</span>';
            if (group.items) {
                skillsHtml += '<div class="about__skill-tags">';
                for (var j = 0; j < group.items.length; j++) {
                    skillsHtml += '<span class="about__skill-tag">' + escapeHTML(group.items[j]) + '</span>';
                }
                skillsHtml += '</div>';
            }
            skillsHtml += '</div>';
        }
        skillsHtml += '</div>';
    }
    var img = d.image ? '<div class="about__image-wrapper"><img class="about__image" alt="' + escapeHTML(d.image_alt || '') + '" src="' + d.image + '" width="1500" height="1892" loading="lazy"></div>' : '';
    return '<section class="section" id="' + data.id + '">' +
        '<h3 class="section__tag">' + escapeHTML(d.heading_label) + '</h3>' +
        '<h2 class="section__title">' + escapeHTML(d.heading) + '</h2>' +
        '<div class="about">' + img +
        '<div class="about__content">' + paras + skillsHtml + '</div>' +
        '</div>' +
    '</section>';
};

renderers.education = function(data) {
    var d = data.data;
    var items = '';
    if (d.items) {
        d.items.forEach(function(item, i) {
            var blocks = '';
            if (item.highlights && item.highlights.length) {
                var listItems = '';
                item.highlights.forEach(function(h) {
                    listItems += '<li class="dossier__list-item">' + escapeHTML(h) + '</li>';
                });
                blocks += '<div class="dossier__block">' +
                    (item.highlights_label ? '<span class="dossier__block-title">' + escapeHTML(item.highlights_label) + '</span>' : '') +
                    '<ul class="dossier__list">' + listItems + '</ul>' +
                '</div>';
            }
            var specs = '';
            if (item.specs) {
                item.specs.forEach(function(s) {
                    var spanClass = s.span ? ' dossier__spec-box--span' : '';
                    specs += '<div class="dossier__spec-box' + spanClass + '">' +
                        '<div class="dossier__spec-key">' + escapeHTML(s.key) + '</div>' +
                        '<div class="dossier__spec-val">' + nl2br(escapeHTML(s.val)) + '</div>' +
                    '</div>';
                });
                specs = '<div class="dossier__specs">' + specs + '</div>';
            }
            var linkHtml = '';
            if (item.link && item.link.url) {
                linkHtml = '<a class="dossier__link" href="' + item.link.url + '" target="_blank">' + escapeHTML(item.link.text) + '</a>';
            }
            var desc = item.description ? '<p class="dossier__desc">' + escapeHTML(item.description) + '</p>' : '';
            var linkMobile = '';
            if (item.link && item.link.url) {
                linkMobile = '<a class="dossier__link dossier__link--mobile" href="' + item.link.url + '" target="_blank">' + escapeHTML(item.link.text) + '</a>';
            }
            items += '<div class="dossier__item">' +
                '<div class="dossier__meta">' +
                    '<span class="dossier__num">' + escapeHTML(item.tab_num || item.num) + '</span>' +
                    '<span class="dossier__date">' + escapeHTML(item.date) + '</span>' +
                    '<span class="dossier__badge">' + escapeHTML(item.badge) + '</span>' +
                    linkHtml +
                '</div>' +
                '<details class="dossier__body"' + (i === 0 ? ' open' : '') + '>' +
                    '<summary class="dossier__cover">' +
                        '<h4 class="dossier__title">' + escapeHTML(item.title) + '</h4>' +
                        '<div class="dossier__inst">' + escapeHTML(item.institution) + '</div>' +
                    '</summary>' +
                    blocks +
                    specs +
                    linkMobile +
                    desc +
                '</details>' +
            '</div>';
        });
    }
    return '<section class="section" id="' + data.id + '">' +
        '<h3 class="section__tag">' + escapeHTML(d.heading_label) + '</h3>' +
        '<h2 class="section__title">' + escapeHTML(d.heading) + '</h2>' +
        '<div class="education">' +
        (d.description ? '<p class="education__description">' + escapeHTML(d.description) + '</p>' : '') +
        '<div class="dossier">' + items + '</div>' +
        '</div>' +
    '</section>';
};

renderers.publications = function(data) {
    var d = data.data;
    var featuredHtml = '';
    if (d.featured && d.featured.length) {
        d.featured.forEach(function(f) {
            var tags = '';
            if (f.tags && f.tags.length) {
                tags = '<div class="pub-featured__tags">' + f.tags.map(function(t) { return '<span class="pub-featured__tag">' + escapeHTML(t) + '</span>'; }).join('') + '</div>';
            }
            var paras = '';
            if (f.paragraphs) {
                f.paragraphs.forEach(function(p) {
                    paras += '<p>' + escapeHTML(p) + '</p>';
                });
            }
            var links = '';
            if (f.links) {
                f.links.forEach(function(l) {
                    var downloadAttr = l.download ? ' download' : '';
                    var iconBtns = '';
                    if (l.iconBtns && l.iconBtns.length) {
                        iconBtns = l.iconBtns.map(function(ib) {
                            return '<a class="btn btn--secondary" href="' + ib.url + '" target="_blank" aria-label="' + escapeHTML(ib.icon) + '">' + icon(ib.icon, 16) + '</a>';
                        }).join('');
                    }
                    var btnLabel = l.btn_label || (l.download ? 'Download' : 'View');
                    links += '<div class="pub-link-item">' +
                        '<div class="pub-link-item__left">' +
                            (l.icon ? icon(l.icon, 24) : '') +
                            '<div>' +
                                '<div class="pub-link-item__label">' + escapeHTML(l.label) + '</div>' +
                                (l.info ? '<div class="pub-link-item__info">' + escapeHTML(l.info) + '</div>' : '') +
                            '</div>' +
                        '</div>' +
                        '<div class="pub-link-item__actions">' +
                            '<a class="btn btn--secondary" href="' + l.url + '"' + downloadAttr + '>' + escapeHTML(btnLabel) + '</a>' +
                            iconBtns +
                        '</div>' +
                    '</div>';
                });
            }
            featuredHtml += '<div class="pub-featured">' +
                tags +
                '<div class="pub-featured__badge">' + escapeHTML(f.badge) + '</div>' +
                '<h4 class="pub-featured__title">' + escapeHTML(f.title) + '</h4>' +
                '<div class="pub-featured__authors">' + escapeHTML(f.authors) + '</div>' +
                '<div class="pub-featured__body">' + paras + '</div>' +
                (f.image ? '<img class="pub-featured__inline-image" src="' + f.image + '" alt="' + escapeHTML(f.title) + '" width="768" height="1024">' : '') +
                '<div class="pub-featured__links">' + links + '</div>' +
            '</div>';
        });
    }
    var items = '';
    if (d.items && d.items.length) {
        d.items.forEach(function(pub) {
            var tags = '';
            if (pub.tags && pub.tags.length) {
                tags = '<div class="pub-item__tags">' + pub.tags.map(function(t) { return '<span class="pub-item__tag">' + escapeHTML(t) + '</span>'; }).join('') + '</div>';
            }
            var links = '';
            if (pub.links) {
                links = pub.links.map(function(l) {
                    var downloadAttr = l.download ? ' download' : '';
                    return '<a class="btn btn--secondary" href="' + l.url + '"' + downloadAttr + '>' +
                        (l.icon ? icon(l.icon, 14) + ' ' : '') +
                        escapeHTML(l.label) + '</a>';
                }).join('');
            }
            items += '<div class="pub-item">' +
                tags +
                (pub.journal ? '<div class="pub-item__journal">' + escapeHTML(pub.journal) + '</div>' : '') +
                '<h4 class="pub-item__title">' + escapeHTML(pub.title) + '</h4>' +
                '<div class="pub-item__authors">' + escapeHTML(pub.authors) + '</div>' +
                (pub.summary ? '<p class="pub-item__summary">' + escapeHTML(pub.summary) + '</p>' : '') +
                (pub.image ? '<img class="pub-item__img" src="' + pub.image + '" alt="' + escapeHTML(pub.title) + '" width="1024" height="686">' : '') +
                '<div class="pub-item__actions">' + links + '</div>' +
            '</div>';
        });
    }
    return '<section class="section" id="' + data.id + '">' +
        '<h3 class="section__tag">' + escapeHTML(d.heading_label) + '</h3>' +
        '<h2 class="section__title">' + escapeHTML(d.heading) + '</h2>' +
        '<p class="publications__focus">' + escapeHTML(d.focus) + '</p>' +
        '<div class="publications">' +
            featuredHtml +
            (items ? '<div class="pub-list">' + items + '</div>' : '') +
            (d.all_link ? '<div class="pub-footer"><a class="btn btn--primary" href="' + d.all_link + '">' + escapeHTML(d.all_link_label) + '</a></div>' : '') +
        '</div>' +
    '</section>';
};

renderers.projects = function(data) {
    var d = data.data;
    var featuredHtml = '';
    if (d.featured && d.featured.length) {
        d.featured.forEach(function(proj) {
            featuredHtml += '<div class="project-card">' +
                (proj.status ? '<span class="project-card__status">' + escapeHTML(proj.status) + '</span>' : '') +
                (proj.image ? '<div class="project-card__image-box"><img class="project-card__image" alt="' + escapeHTML(proj.alt || '') + '" src="' + proj.image + '" width="768" height="1024"></div>' : '') +
                '<div class="project-card__content">' +
                    '<h4 class="project-card__title">' + escapeHTML(proj.title) + '</h4>' +
                    (proj.description ? '<p class="project-card__desc">' + escapeHTML(proj.description) + '</p>' : '') +
                    (proj.url ? '<a class="btn btn--secondary" href="' + proj.url + '">' + escapeHTML(proj.btn_label || 'View') + '</a>' : '') +
                '</div>' +
            '</div>';
        });
    }
    var items = '';
    if (d.items && d.items.length) {
        d.items.forEach(function(proj) {
            items += '<div class="project-box">' +
                '<div class="project-box__top">' +
                    (proj.status ? '<span class="project-box__status">' + escapeHTML(proj.status) + '</span>' : '') +
                '</div>' +
                '<div>' +
                    '<h5 class="project-box__title">' + escapeHTML(proj.title) + '</h5>' +
                    (proj.image ? '<img class="project-box__img" src="' + proj.image + '" alt="' + escapeHTML(proj.title) + '" width="768" height="1024">' : '') +
                    (proj.description ? '<p class="project-box__desc">' + escapeHTML(proj.description) + '</p>' : '') +
                '</div>' +
                (proj.url ? '<a class="btn btn--secondary project-box__btn" href="' + proj.url + '">' + escapeHTML(proj.btn_label || 'View') + '</a>' : '') +
            '</div>';
        });
    }
    return '<section class="section" id="' + data.id + '">' +
        '<h3 class="section__tag">' + escapeHTML(d.heading_label) + '</h3>' +
        '<h2 class="section__title">' + escapeHTML(d.heading) + '</h2>' +
        (d.tagline ? '<p class="section__tagline">' + escapeHTML(d.tagline) + '</p>' : '') +
        '<div class="projects">' +
            (featuredHtml ? '<div class="projects__featured-container">' + featuredHtml + '</div>' : '') +
            (items ? '<div class="projects__grid">' + items + '</div>' : '') +
            (d.view_all ? '<div class="projects__footer"><a class="btn btn--primary" href="' + d.view_all.url + '">' + escapeHTML(d.view_all.label) + '</a></div>' : '') +
        '</div>' +
    '</section>';
};

renderers.blog = function(data, cardsHtml) {
    var d = data.data;
    return '<section class="section" id="' + data.id + '">' +
        '<h3 class="section__tag">' + escapeHTML(d.heading_label) + '</h3>' +
        '<h2 class="section__title">' + escapeHTML(d.heading) + '</h2>' +
        (d.tagline ? '<p class="section__tagline">' + escapeHTML(d.tagline) + '</p>' : '') +
        '<div class="blog-container" id="blogPostPreview">' + (cardsHtml || '') + '</div>' +
        (d.read_more ? '<div class="blog-view-all"><a class="btn btn--primary" href="' + d.read_more_url + '">' + escapeHTML(d.read_more) + '</a></div>' : '') +
    '</section>';
};

renderers.contact = function(data) {
    var d = data.data;
    var addressHtml = '';
    if (d.address && d.address.length) {
        addressHtml = d.address.map(function(line) { return escapeHTML(line); }).join('<br/>');
    }
    var iconLinks = '';
    if (d.icons && d.icons.length) {
        iconLinks = '<div class="contact__socials">';
        d.icons.forEach(function(icon) {
            iconLinks += '<a class="contact__social-icon" href="' + icon.url + '" target="_blank" rel="noopener">' +
                '<img src="assets/icons/academic social icons/' + icon.name + '.svg" alt="' + icon.name + '" width="24" height="24">' +
            '</a>';
        });
        iconLinks += '</div>';
    }
    var formHtml = '';
    var r = d.right;
    if (r && r.form) {
        formHtml = '<form class="contact__form" id="contactForm">' +
            '<div class="contact__field">' +
                '<label class="contact__field-label">Name</label>' +
                '<input class="contact__input" placeholder="Your Name" type="text" name="from_name" required/>' +
            '</div>' +
            '<div class="contact__field">' +
                '<label class="contact__field-label">Email</label>' +
                '<input class="contact__input" placeholder="your.email@example.com" type="email" name="from_email" required/>' +
            '</div>' +
            '<div class="contact__field">' +
                '<label class="contact__field-label">Subject</label>' +
                '<input class="contact__input" placeholder="Subject" type="text" name="subject"/>' +
            '</div>' +
            '<div class="contact__field">' +
                '<label class="contact__field-label">Message</label>' +
                '<textarea class="contact__input contact__input--textarea" placeholder="Your message here..." name="message" required></textarea>' +
            '</div>' +
            '<button class="btn btn--primary contact__submit" type="submit">' + escapeHTML(d.button || 'Send a Message') + '</button>' +
        '</form>';
    } else if (r && r.map) {
        formHtml = '<div class="contact-map"><iframe src="' + escapeHTML(r.map) + '" width="100%" height="100%" style="border:0;min-height:300px" allowfullscreen="" loading="lazy"></iframe></div>';
    } else if (r && r.image) {
        formHtml = '<div class="contact-image"><img src="' + escapeHTML(r.image) + '" alt="' + escapeHTML(r.image_alt || '') + '"></div>';
    }
    var icons = d.custom_icons || {};
    var iconMap = {
        email: icons.email || 'mail',
        phone: icons.phone || 'phone',
        active_hours: icons.active_hours || 'schedule',
        best_time_to_email: icons.best_time_to_email || 'brightness_auto',
        department: icons.department || 'account_balance',
        address: icons.address || 'location_on'
    };
    var lbl = d.labels || {};
    var labelMap = {
        email: lbl.email || 'Email',
        phone: lbl.phone || 'Phone',
        active_hours: lbl.active_hours || 'Brew Hours',
        best_time_to_email: lbl.best_time_to_email || 'Best Time to Contact',
        department: lbl.department || 'Department',
        address: lbl.address || 'Lab Location'
    };
    return '<section class="section" id="' + data.id + '">' +
        '<h3 class="section__tag">' + escapeHTML(d.heading_label) + '</h3>' +
        '<h2 class="section__title">' + escapeHTML(d.heading) + '</h2>' +
        (d.message ? '<p class="contact__message">' + escapeHTML(d.message) + '</p>' : '') +
        '<div class="contact">' +
            '<div class="contact__left">' +
                '<div class="contact__details">' +
                    (d.email ? '<div class="contact__info-box">' + icon(iconMap.email, 28) + '<div class="contact__info-body"><div class="contact__info-label">' + labelMap.email + '</div><div class="contact__info-value">' + escapeHTML(d.email) + '</div></div></div>' : '') +
                    (d.phone ? '<div class="contact__info-box">' + icon(iconMap.phone, 28) + '<div class="contact__info-body"><div class="contact__info-label">' + labelMap.phone + '</div><div class="contact__info-value">' + escapeHTML(d.phone) + '</div></div></div>' : '') +
                    (d.active_hours ? '<div class="contact__info-box">' + icon(iconMap.active_hours, 28) + '<div class="contact__info-body"><div class="contact__info-label">' + labelMap.active_hours + '</div><div class="contact__info-value">' + escapeHTML(d.active_hours.time) + ' <span style="font-size:12px;font-style:italic;opacity:0.8;"><br/>' + escapeHTML(d.active_hours.note) + '</span></div></div></div>' : '') +
                    (d.best_time_to_email ? '<div class="contact__info-box">' + icon(iconMap.best_time_to_email, 28) + '<div class="contact__info-body"><div class="contact__info-label">' + labelMap.best_time_to_email + '</div><div class="contact__info-value">' + nl2br(escapeHTML(d.best_time_to_email)) + '</div></div></div>' : '') +
                    (d.department ? '<div class="contact__info-box">' + icon(iconMap.department, 28) + '<div class="contact__info-body"><div class="contact__info-label">' + labelMap.department + '</div><div class="contact__info-value">' + escapeHTML(d.department) + '<br/><span style="font-size:14px;opacity:0.8;">' + escapeHTML(d.institution || '') + '</span></div></div></div>' : '') +
                    (addressHtml ? '<div class="contact__info-box">' + icon(iconMap.address, 28) + '<div class="contact__info-body"><div class="contact__info-label">' + labelMap.address + '</div><div class="contact__info-value">' + addressHtml + '</div></div></div>' : '') +
                '</div>' +
                iconLinks +
            '</div>' +
            '<div class="contact__right">' + formHtml + '</div>' +
        '</div>' +
    '</section>';
};
