import { Accordion, Pill, Group, Paper } from '@mantine/core';
import { Dispatch, SetStateAction } from 'react';

interface FilterOption {
  id: number | string;
  name: string;
}

interface FilterListProps {
  filters: { 
    title: string; 
    options: FilterOption[]; 
    selected: number | null | string; 
    onChange: Dispatch<SetStateAction<string | null | number>> ;
  }[];
  multiple?: boolean;
}

const FilterList = ({ filters, multiple = true}: FilterListProps) => {
  return (
    <Paper p="md" withBorder style={{ position: 'sticky', top: 20 }}>
      <Accordion multiple={multiple} defaultValue={filters.map(f => f.title)} >
        {filters.map((section) => (
          <Accordion.Item key={section.title} value={section.title}>
            <Accordion.Control>{section.title}</Accordion.Control>
            <Accordion.Panel>
              <Group gap="xs">
                {section.options.map((option) => (
                  <Pill
                    key={option.id}
                    withRemoveButton={section.selected === option.id}
                    onRemove={() => section.onChange(null)}
                    style={{ cursor: 'pointer' }}
                    bg={section.selected === option.id ? 'blue' : undefined}
                    c={section.selected === option.id ? 'white' : undefined}
                    onClick={() => section.onChange(option.id)}
                  >
                    {option.name}
                  </Pill>
                ))}
              </Group>
            </Accordion.Panel>
          </Accordion.Item>
        ))}
      </Accordion>
    </Paper>
  );
};

export default FilterList;
