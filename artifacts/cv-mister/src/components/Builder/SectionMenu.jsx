import React, { useState } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { MoreVertical, Tag, Scissors, Eraser, Check } from 'lucide-react';
import useResumeStore from '../../store/useResumeStore';
import useStyleStore from '../../store/useStyleStore';
import { t } from '../../utils/locales';

export default function SectionMenu({ sectionKey }) {
  const { language } = useStyleStore();
  const { customTitles, pageBreaks, layoutColumns, setCustomTitle, clearSection, togglePageBreak, setSectionColumn, setRenamingSection } = useResumeStore();
  
  const currentTitle = customTitles[sectionKey] || t(sectionKey, language);
  const hasPageBreak = pageBreaks.includes(sectionKey);
  
  const IsInSide = (layoutColumns.columnSide || []).includes(sectionKey);
  const currentColumn = IsInSide ? 'sidebar' : 'main';

  const startRenaming = () => {
    setRenamingSection(sectionKey);
  };

return (
    <div className="relative inline-block text-start flex-shrink-0" dir={language === 'ar' ? 'rtl' : 'ltr'} onClick={(e) => e.stopPropagation()}>
      <Menu as="div" className="relative">
        <Menu.Button className="p-1.5 rounded-md hover:bg-white/10 text-gray-400 hover:text-white transition-all outline-none flex items-center justify-center">
          <MoreVertical size={16} />
        </Menu.Button>
        <Transition
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className={`absolute z-50 mt-2 w-52 transform 
            ${language === 'ar' ? 'left-0 origin-top-left' : 'right-0 origin-top-right'}
            bg-[#2A2A3C] border border-[#3A3A5A] rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] outline-none p-1.5
            font-global`} style={{ fontFamily: "var(--global-font)" }}>
            
            <Menu.Item>
              {({ active, close }) => (
                <button
                  onClick={() => { setRenamingSection(sectionKey); close(); }}
                  className={`${active ? 'bg-[#3A3A5A] text-white' : 'text-gray-200'} 
                    flex w-full items-center px-3 py-2.5 text-[13px] font-medium transition-colors rounded-[8px]`}
                >
                  <span className="flex-1 text-start">{t('rename_section', language) || "Rename section"}</span>
                </button>
              )}
            </Menu.Item>
          </Menu.Items>
        </Transition>
      </Menu>
    </div>
  );
}
