#!/usr/bin/env python
# -*- coding: utf-8 -*-
from django.urls import re_path
from . import views

urlpatterns = [
    # examples of using the webgateway base templates
    re_path(r'^webclient_templates/(?P<base_template>[a-z0-9_]+)/',
            views.webclient_templates, name='webclient_templates'),
]